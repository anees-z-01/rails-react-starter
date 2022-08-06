# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Jobs', type: :request do
  describe 'GET /index' do
    let!(:job) { create(:job, :open) }
    let!(:closed_job) { create(:job, :closed) }

    context 'when open jobs exists' do
      it 'will return jobs' do
        get '/api/jobs'

        parsed_response = JSON.parse(response.body)['jobs']

        expect(response).to have_http_status(:ok)
        expect(parsed_response.pluck('title')).to include(job.title)
        expect(parsed_response.pluck('title')).not_to include(closed_job.title)
      end
    end

    context 'when no open jobs exists' do
      it 'will return emprt response' do
        Job.open.map(&:destroy)
        get '/api/jobs'

        parsed_response = JSON.parse(response.body)['jobs']

        expect(response).to have_http_status(:ok)
        expect(parsed_response).to be_empty
      end
    end

    describe '#filters' do
      context '.open' do
        it 'will return all opened jobs' do
          get '/api/jobs', params: { filter: 'open' }

          parsed_response = JSON.parse(response.body)['jobs']

          expect(response).to have_http_status(:ok)
          expect(parsed_response.pluck('title')).to include(job.title)
          expect(parsed_response.pluck('title')).not_to include(closed_job.title)
        end
      end

      context '.closed' do
        it 'will return all closed jobs' do
          get '/api/jobs', params: { filter: 'closed' }

          parsed_response = JSON.parse(response.body)['jobs']

          expect(response).to have_http_status(:ok)
          expect(parsed_response.pluck('title')).to include(closed_job.title)
          expect(parsed_response.pluck('title')).not_to include(job.title)
          expect(parsed_response.pluck('title')).not_to include(job.title)
        end
      end

      context '.draft' do
        let!(:draft_job) { create(:job, :draft) }

        it 'hides drafts from visitors' do
          get '/api/jobs', params: { filter: 'draft' }

          expect(response).to have_http_status(:ok)
          expect(JSON.parse(response.body)['jobs']).to be_empty
        end

        it 'hides drafts from applicants' do
          get '/api/jobs', params: { filter: 'draft' }, headers: login_and_return_headers(create(:user))

          expect(JSON.parse(response.body)['jobs']).to be_empty
        end

        it 'lists drafts for admins' do
          get '/api/jobs', params: { filter: 'draft' }, headers: login_and_return_headers(create(:user, :admin))

          parsed_response = JSON.parse(response.body)['jobs']

          expect(response).to have_http_status(:ok)
          expect(parsed_response.pluck('title')).to include(draft_job.title)
          expect(parsed_response.pluck('title')).not_to include(closed_job.title)
        end
      end

      context '.invalid' do
        it 'ignores unknown status filters and returns open jobs' do
          get '/api/jobs', params: { filter: 'unknown_status' }

          parsed_response = JSON.parse(response.body)['jobs']

          expect(response).to have_http_status(:ok)
          expect(parsed_response.pluck('title')).to include(job.title)
          expect(parsed_response.pluck('title')).not_to include(closed_job.title)
        end
      end
    end

    context '.pagination' do
      it 'will return pagination detail in response' do
        get '/api/jobs'

        parsed_response = JSON.parse(response.body)

        expect(response).to have_http_status(:ok)
        expect(parsed_response['page_info']['page']).to eq(1)
      end
    end
  end

  describe 'GET /show' do
    context 'when job found' do
      let!(:job) { create(:job, :open) }

      it 'will return job' do
        get "/api/jobs/#{job.slug}"

        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)['title']).to eq(job.title)
      end

      it 'does not expose other applicants' do
        create(:job_application, job: job)

        get "/api/jobs/#{job.slug}"

        body = JSON.parse(response.body)
        expect(body).not_to have_key('job_applications')
        expect(body['application_status']).to be_nil
      end

      it "returns the signed-in user's own application status" do
        user = create(:user)
        create(:job_application, job: job, user: user)
        create(:job_application, job: job)

        get "/api/jobs/#{job.slug}", headers: login_and_return_headers(user)

        expect(JSON.parse(response.body)['application_status']).to eq('applied')
      end
    end

    context 'when job is a draft' do
      let!(:draft_job) { create(:job, :draft) }

      it 'is not found for visitors' do
        get "/api/jobs/#{draft_job.slug}"

        expect(response).to have_http_status(:not_found)
      end

      it 'is visible to admins' do
        get "/api/jobs/#{draft_job.slug}", headers: login_and_return_headers(create(:user, :admin))

        expect(response).to have_http_status(:ok)
      end
    end

    context 'when job not found' do
      it 'will return not found exception' do
        get "/api/jobs/#{Faker::Job.title.parameterize}"

        expect(response).to have_http_status(:not_found)
        expect(JSON.parse(response.body)['message']).to eq("Couldn't find Job")
      end
    end
  end

  describe 'PUT /update' do
    let!(:job) { create(:job, :open) }

    context 'when not logged in' do
      it 'returns unauthorized and leaves the job alone' do
        put "/api/jobs/#{job.slug}", params: { status: 'closed' }

        expect(response).to have_http_status(:unauthorized)
        expect(job.reload.status).to eq('open')
      end
    end

    context 'when logged in as an applicant' do
      it 'returns forbidden and leaves the job alone' do
        put "/api/jobs/#{job.slug}", params: { status: 'closed' }, headers: login_and_return_headers(create(:user))

        expect(response).to have_http_status(:forbidden)
        expect(job.reload.status).to eq('open')
      end
    end

    context 'when logged in as an admin' do
      let(:headers) { login_and_return_headers(create(:user, :admin)) }

      it 'will return not found exception for an unknown slug' do
        put "/api/jobs/#{Faker::Job.title.parameterize}", params: { status: 'open' }, headers: headers

        expect(response).to have_http_status(:not_found)
        expect(JSON.parse(response.body)['message']).to eq("Couldn't find Job")
      end

      %w[closed draft open].each do |status|
        it "updates the status to #{status}" do
          put "/api/jobs/#{job.slug}", params: { status: status }, headers: headers

          expect(response).to have_http_status(:ok)
          expect(JSON.parse(response.body)['status']).to eq(status)
          expect(job.reload.status).to eq(status)
        end
      end

      it 'ignores attributes other than status' do
        put "/api/jobs/#{job.slug}", params: { status: 'closed', title: 'Renamed' }, headers: headers

        expect(job.reload.title).not_to eq('Renamed')
      end
    end
  end
end

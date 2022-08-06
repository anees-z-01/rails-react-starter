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

        it 'will return all draft jobs' do
          get '/api/jobs', params: { filter: 'draft' }

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
    context 'when job not found' do
      it 'will return not found exception' do
        put "/api/jobs/#{Faker::Job.title.parameterize}", params: { status: 'open' }

        expect(response).to have_http_status(:not_found)
        expect(JSON.parse(response.body)['message']).to eq("Couldn't find Job")
      end
    end

    context 'when job found' do
      let!(:job) { create(:job) }

      context '.open' do
        it 'will update job status' do
          put "/api/jobs/#{job.slug}", params: { status: 'open' }

          expect(response).to have_http_status(:ok)
          expect(JSON.parse(response.body)['status']).to eq('open')
          expect(job.reload.status).to eq('open')
        end
      end

      context '.draft' do
        it 'will update job status' do
          put "/api/jobs/#{job.slug}", params: { status: 'draft' }

          expect(response).to have_http_status(:ok)
          expect(JSON.parse(response.body)['status']).to eq('draft')
          expect(job.reload.status).to eq('draft')
        end
      end

      context '.closed' do
        it 'will update job status' do
          put "/api/jobs/#{job.slug}", params: { status: 'closed' }

          expect(response).to have_http_status(:ok)
          expect(JSON.parse(response.body)['status']).to eq('closed')
          expect(job.reload.status).to eq('closed')
        end
      end
    end
  end
end

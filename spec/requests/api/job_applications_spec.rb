require 'rails_helper'

RSpec.describe 'JobApplications', type: :request do
  describe 'GET /index' do
    context 'when user not logged in' do
      it 'returns unauthorized exception' do
        get '/api/job_applications'

        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)['errors']).to include('You need to sign in or sign up before continuing.')
      end
    end

    context 'when user logged in' do
      let(:user) { create(:user) }

      before(:each) do
        @headers = login_and_return_headers(user)
      end

      context 'when user applied for job' do
        let!(:job_application) { create(:job_application, user: user) }
        let!(:withdrawn_job_application) { create(:job_application, user: user, status: :withdrawn) }

        it 'return job applications' do
          get '/api/job_applications', headers: @headers.as_json

          parsed_response = JSON.parse(response.body)

          expect(response).to have_http_status(:ok)
          expect(parsed_response['job_applications'].pluck('status')).to include(job_application.status)
          expect(parsed_response['job_applications'].pluck('id')).to include(job_application.id)
          expect(parsed_response['job_applications'].pluck('id')).not_to include(withdrawn_job_application.id)
        end
      end

      context 'when user did not applied for any job' do
        it 'returns empty response' do
          get '/api/job_applications', headers: @headers.as_json

          expect(response).to have_http_status(:ok)
          expect(JSON.parse(response.body)['job_applications']).to be_empty
        end
      end

      describe '.filter' do
        let!(:applied_application) { create(:job_application, user: user, status: :applied) }
        let!(:withdrawn_application) { create(:job_application, user: user, status: :withdrawn) }
        let!(:reviewed_application) { create(:job_application, user: user, status: :reviewed) }
        let!(:rejected_application) { create(:job_application, user: user, status: :rejected) }

        context '#applied' do
          it 'returns only applied applications' do
            get '/api/job_applications', params: { filter: 'applied' }, headers: @headers.as_json

            parsed_response = JSON.parse(response.body)

            expect(response).to have_http_status(:ok)
            expect(parsed_response['job_applications'].pluck('id')).to include(applied_application.id)
            expect(parsed_response['job_applications'].pluck('id')).not_to include(withdrawn_application.id)
            expect(parsed_response['job_applications'].pluck('id')).not_to include(reviewed_application.id)
            expect(parsed_response['job_applications'].pluck('id')).not_to include(rejected_application.id)
          end
        end

        context '#withdrawn' do
          it 'returns only withdrawn applications' do
            get '/api/job_applications', params: { filter: 'withdrawn' }, headers: @headers.as_json

            parsed_response = JSON.parse(response.body)

            expect(response).to have_http_status(:ok)
            expect(parsed_response['job_applications'].pluck('id')).to include(withdrawn_application.id)
            expect(parsed_response['job_applications'].pluck('id')).not_to include(applied_application.id)
            expect(parsed_response['job_applications'].pluck('id')).not_to include(reviewed_application.id)
            expect(parsed_response['job_applications'].pluck('id')).not_to include(rejected_application.id)
          end
        end

        context '#reviewed' do
          it 'returns only reviewed applications' do
            get '/api/job_applications', params: { filter: 'reviewed' }, headers: @headers.as_json

            parsed_response = JSON.parse(response.body)

            expect(response).to have_http_status(:ok)
            expect(parsed_response['job_applications'].pluck('id')).to include(reviewed_application.id)
            expect(parsed_response['job_applications'].pluck('id')).not_to include(withdrawn_application.id)
            expect(parsed_response['job_applications'].pluck('id')).not_to include(applied_application.id)
            expect(parsed_response['job_applications'].pluck('id')).not_to include(rejected_application.id)
          end
        end

        context '#rejected' do
          it 'returns only rejected applications' do
            get '/api/job_applications', params: { filter: 'rejected' }, headers: @headers.as_json

            parsed_response = JSON.parse(response.body)

            expect(response).to have_http_status(:ok)
            expect(parsed_response['job_applications'].pluck('id')).to include(rejected_application.id)
            expect(parsed_response['job_applications'].pluck('id')).not_to include(withdrawn_application.id)
            expect(parsed_response['job_applications'].pluck('id')).not_to include(reviewed_application.id)
            expect(parsed_response['job_applications'].pluck('id')).not_to include(applied_application.id)
          end
        end

        context '#invalid' do
          it 'ignores unknown filters and returns non-withdrawn applications' do
            get '/api/job_applications', params: { filter: 'unknown_status' }, headers: @headers.as_json

            parsed_response = JSON.parse(response.body)

            expect(response).to have_http_status(:ok)
            expect(parsed_response['job_applications'].pluck('id')).to include(applied_application.id)
            expect(parsed_response['job_applications'].pluck('id')).to include(reviewed_application.id)
            expect(parsed_response['job_applications'].pluck('id')).to include(rejected_application.id)
            expect(parsed_response['job_applications'].pluck('id')).not_to include(withdrawn_application.id)
          end
        end
      end

      context '.filters' do
        it 'will return pagination detail in response' do
          get '/api/job_applications', headers: @headers.as_json

          parsed_response = JSON.parse(response.body)

          expect(response).to have_http_status(:ok)
          expect(parsed_response['page_info']['page']).to eq(1)
        end
      end
    end
  end

  describe 'GET /show' do
    context 'when user not logged in' do
      let!(:job_application) { create(:job_application) }

      it 'returns unauthorized exception' do
        get "/api/job_applications/#{job_application.id}"

        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)['errors']).to include('You need to sign in or sign up before continuing.')
      end
    end

    context 'when user logged in' do
      let(:user) { create(:user) }

      before(:each) do
        @headers = login_and_return_headers(user)
      end

      context 'when job application not found' do
        it 'returns not found exception' do
          get "/api/job_applications/#{JobApplication.maximum(:id).to_i + 1}", headers: @headers.as_json

          expect(response).to have_http_status(:not_found)
          expect(JSON.parse(response.body)['message']).to include("Couldn't find JobApplication")
        end
      end

      context 'when job application exists but does not belongs to logged in user' do
        let(:application) { create(:job_application) }

        it 'returns not found exception' do
          get "/api/job_applications/#{application.id}", headers: @headers.as_json

          expect(response).to have_http_status(:not_found)
          expect(JSON.parse(response.body)['message']).to include("Couldn't find JobApplication")
        end
      end

      context 'when job application found' do
        let(:application) { create(:job_application, user: user) }

        it 'returns job application' do
          get "/api/job_applications/#{application.id}", headers: @headers.as_json

          expect(response).to have_http_status(:ok)
          expect(JSON.parse(response.body)['id']).to eq(application.id)
          expect(JSON.parse(response.body)['status']).to eq(application.status)
        end
      end
    end
  end

  describe 'DELETE /destroy' do
    context 'when user not logged in' do
      let!(:job_application) { create(:job_application) }

      it 'returns unauthorized exception' do
        delete "/api/job_applications/#{job_application.id}"

        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)['errors']).to include('You need to sign in or sign up before continuing.')
      end
    end

    context 'when user logged in' do
      let(:user) { create(:user) }

      before(:each) do
        @headers = login_and_return_headers(user)
      end

      context 'when job application not found' do
        it 'returns not found exception' do
          delete "/api/job_applications/#{JobApplication.maximum(:id).to_i + 1}", headers: @headers.as_json

          expect(response).to have_http_status(:not_found)
          expect(JSON.parse(response.body)['message']).to include("Couldn't find JobApplication")
        end
      end

      context 'when job application exists but does not belongs to logged in user' do
        let(:application) { create(:job_application) }

        it 'returns not found exception' do
          delete "/api/job_applications/#{application.id}", headers: @headers.as_json

          expect(response).to have_http_status(:not_found)
          expect(JSON.parse(response.body)['message']).to include("Couldn't find JobApplication")
        end
      end

      context 'when job application found' do
        let(:application) { create(:job_application, user: user) }

        it 'returns job application with updated status withdrawn' do
          delete "/api/job_applications/#{application.id}", headers: @headers.as_json

          parsed_response = JSON.parse(response.body)

          expect(response).to have_http_status(:ok)
          expect(parsed_response['id']).to eq(application.id)
          expect(parsed_response['status']).to eq('withdrawn')
        end
      end
    end
  end

  describe 'POST /create' do
    context 'when user not logged in' do
      let!(:job_application) { create(:job_application) }

      it 'returns unauthorized exception' do
        post '/api/job_applications/'

        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)['errors']).to include('You need to sign in or sign up before continuing.')
      end
    end

    context 'when user is logged in' do
      let(:user) { create(:user) }

      before(:each) do
        @headers = login_and_return_headers(user)
      end

      context 'when params are missing' do
        it 'returns exception' do
          post '/api/job_applications/', headers: @headers.as_json

          expect(response).to have_http_status(:unprocessable_entity)
          expect(JSON.parse(response.body)['message']).to include('Job must exist')
        end
      end

      context 'when job does not exist' do
        it 'return exception' do
          post '/api/job_applications/', params: { job_id: Job.maximum(:id).to_i + 1 }, headers: @headers.as_json

          expect(response).to have_http_status(:unprocessable_entity)
          expect(JSON.parse(response.body)['message']).to include('Job must exist')
        end
      end

      context 'when job exists' do
        let(:job) { create(:job, :open) }

        context 'when job status is closed' do
          let(:closed_job) { create(:job, :closed) }

          it 'return exception' do
            post '/api/job_applications/', params: { job_id: closed_job.id }, headers: @headers.as_json

            expect(response).to have_http_status(:unprocessable_entity)
            expect(JSON.parse(response.body)['message']).to include('You cannot apply to a closed job')
          end
        end

        context 'when job status is open' do
          it 'returns created job_application' do
            post '/api/job_applications/', params: { job_id: job.id }, headers: @headers.as_json

            parsed_response = JSON.parse(response.body)

            expect(response).to have_http_status(:created)
            expect(parsed_response['job_id']).to eq(job.id)
          end
        end

        context 'when job status is draft' do
          let(:draft_job) { create(:job, :draft) }

          it 'returns created job_application' do
            post '/api/job_applications/', params: { job_id: draft_job.id }, headers: @headers.as_json

            parsed_response = JSON.parse(response.body)

            expect(response).to have_http_status(:created)
            expect(parsed_response['job_id']).to eq(draft_job.id)
          end
        end
      end
    end
  end

  describe 'PATCH /update' do
    context 'when user not logged in' do
      let!(:job_application) { create(:job_application) }

      it 'returns unauthorized exception' do
        patch "/api/job_applications/#{job_application.id}"

        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)['errors']).to include('You need to sign in or sign up before continuing.')
      end
    end

    context 'when user is logged in' do
      let(:user) { create(:user) }
      let(:job_application) { create(:job_application, user: user) }

      before(:each) do
        @headers = login_and_return_headers(user)
      end

      context 'when params are missing' do
        it 'returns job application' do
          patch "/api/job_applications/#{job_application.id}", headers: @headers.as_json

          expect(response).to have_http_status(:ok)
          expect(JSON.parse(response.body)['status']).to eq(job_application.status)
        end
      end

      context 'when params are present' do
        context '.applied' do
          it 'returns job application' do
            patch "/api/job_applications/#{job_application.id}", params: { status: 'applied' }, headers: @headers.as_json

            expect(response).to have_http_status(:ok)
            expect(JSON.parse(response.body)['status']).to eq('applied')
          end
        end

        context '.withdrawn' do
          it 'returns job application' do
            patch "/api/job_applications/#{job_application.id}", params: { status: 'withdrawn' }, headers: @headers.as_json

            expect(response).to have_http_status(:ok)
            expect(JSON.parse(response.body)['status']).to eq('withdrawn')
          end
        end

        context '.reviewed' do
          it 'returns job application' do
            patch "/api/job_applications/#{job_application.id}", params: { status: 'reviewed' }, headers: @headers.as_json

            expect(response).to have_http_status(:ok)
            expect(JSON.parse(response.body)['status']).to eq('reviewed')
          end
        end

        context '.rejected' do
          it 'returns job application' do
            patch "/api/job_applications/#{job_application.id}", params: { status: 'rejected' }, headers: @headers.as_json

            expect(response).to have_http_status(:ok)
            expect(JSON.parse(response.body)['status']).to eq('rejected')
          end
        end
      end
    end
  end
end

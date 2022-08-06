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

      context 'when the application was already rejected' do
        let(:application) { create(:job_application, user: user, status: :rejected) }

        it 'keeps it rejected' do
          delete "/api/job_applications/#{application.id}", headers: @headers.as_json

          expect(response).to have_http_status(:unprocessable_entity)
          expect(JSON.parse(response.body)['message']).to eq('Only applied or reviewed applications can be withdrawn')
          expect(application.reload).to be_rejected
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
            expect(JSON.parse(response.body)['message']).to include('You can only apply to an open job')
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

          it 'rejects the application' do
            post '/api/job_applications/', params: { job_id: draft_job.id }, headers: @headers.as_json

            expect(response).to have_http_status(:unprocessable_entity)
            expect(JSON.parse(response.body)['message']).to include('You can only apply to an open job')
          end
        end

        context 'when the user already applied' do
          it 'rejects a second application' do
            create(:job_application, job: job, user: user)

            post '/api/job_applications/', params: { job_id: job.id }, headers: @headers.as_json

            expect(response).to have_http_status(:unprocessable_entity)
            expect(JSON.parse(response.body)['message']).to include('Job has already been applied to')
          end
        end

        context 'when user_id or status are sent' do
          it 'ignores them' do
            other = create(:user)

            post '/api/job_applications/', params: { job_id: job.id, user_id: other.id, status: 'reviewed' },
                                           headers: @headers.as_json

            created = JobApplication.find(JSON.parse(response.body)['id'])
            expect(created.user).to eq(user)
            expect(created).to be_applied
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

      context 'when status is missing' do
        it 'returns bad request' do
          patch "/api/job_applications/#{job_application.id}", headers: @headers.as_json

          expect(response).to have_http_status(:bad_request)
          expect(JSON.parse(response.body)['message']).to eq('Missing parameter: status')
        end
      end

      it 'lets the applicant withdraw' do
        patch "/api/job_applications/#{job_application.id}", params: { status: 'withdrawn' }, headers: @headers.as_json

        expect(response).to have_http_status(:ok)
        expect(job_application.reload).to be_withdrawn
      end

      %w[reviewed rejected applied].each do |status|
        it "does not let the applicant set #{status}" do
          job_application.withdrawn!

          patch "/api/job_applications/#{job_application.id}", params: { status: status }, headers: @headers.as_json

          expect(response).to have_http_status(:forbidden)
          expect(job_application.reload).to be_withdrawn
        end
      end

      it 'does not withdraw a rejected application' do
        job_application.rejected!

        patch "/api/job_applications/#{job_application.id}", params: { status: 'withdrawn' }, headers: @headers.as_json

        expect(response).to have_http_status(:unprocessable_entity)
        expect(job_application.reload).to be_rejected
      end

      it "returns not found for another user's application" do
        other = create(:job_application)

        patch "/api/job_applications/#{other.id}", params: { status: 'withdrawn' }, headers: @headers.as_json

        expect(response).to have_http_status(:not_found)
        expect(other.reload).to be_applied
      end
    end

    context 'when logged in as an admin' do
      let(:admin) { create(:user, :admin) }
      let(:job_application) { create(:job_application) }

      before(:each) do
        @headers = login_and_return_headers(admin)
      end

      it "reviews another user's application" do
        patch "/api/job_applications/#{job_application.id}", params: { status: 'reviewed' }, headers: @headers.as_json

        expect(response).to have_http_status(:ok)
        expect(job_application.reload).to be_reviewed
      end

      it 'rejects an unknown status with 422' do
        patch "/api/job_applications/#{job_application.id}", params: { status: 'hired' }, headers: @headers.as_json

        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)['message']).to include('Status is not included in the list')
      end
    end
  end
end

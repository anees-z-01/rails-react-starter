require 'rails_helper'

RSpec.describe JobApplication, type: :model do
  describe 'Associations' do
    it { should belong_to(:job) }
    it { should belong_to(:user) }
  end

  describe 'Validations' do
    subject { build(:job_application) }

    it { should validate_uniqueness_of(:job_id).scoped_to(:user_id) }

    describe '.job_not_closed' do
      let(:job_application) { build(:job_application) }

      context 'when job is closed' do
        it 'will generate validation error' do
          job_application.job.closed!

          expect(job_application.valid?).to be_falsey
          expect(job_application.errors.full_messages).to include('You cannot apply to a closed job')
        end
      end

      context 'when job is draft' do
        it 'will create job_application successfully' do
          job_application.job.draft!

          expect(job_application.valid?).to be_truthy
          expect(job_application.save!).to be_truthy
        end
      end

      context 'when job is open' do
        it 'will create job_application successfully' do
          job_application.job.open!

          expect(job_application.valid?).to be_truthy
          expect(job_application.save!).to be_truthy
        end
      end
    end
  end

  describe 'Enum' do
    it { should define_enum_for(:status).with_values(%i[applied reviewed rejected withdrawn]) }
  end
end

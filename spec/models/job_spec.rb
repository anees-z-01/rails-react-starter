require 'rails_helper'

RSpec.describe Job, type: :model do
  describe 'Associations' do
    it { should have_many(:job_applications).dependent(:destroy) }
  end

  describe 'Validations' do
    subject { build(:job) }

    it { should validate_presence_of(:title) }
    it { should validate_presence_of(:status) }
    it { should validate_presence_of(:description) }

    it { should validate_uniqueness_of(:title).case_insensitive }
  end

  describe 'Enum' do
    it { should define_enum_for(:status).with_values(%i[open closed draft]).validating }
  end

  describe 'callbacks' do
    describe '#slug' do
      let(:job) { create(:job) }

      it 'should be automatically generated' do
        expect(job.slug).to_not be_nil
      end

      it 'should be unique' do
        job2 = build(:job, title: job.title)

        expect(job2.valid?).to be_falsey
        expect(job2.errors.full_messages).to include('Title has already been taken')
      end

      it 'follows title changes' do
        job.update!(title: 'Staff Platform Engineer')

        expect(job.slug).to eq('staff-platform-engineer')
      end

      it 'rejects titles that differ only by case' do
        job2 = build(:job, title: job.title.upcase)

        expect(job2).not_to be_valid
      end

      it 'rejects titles that collapse to an existing slug' do
        create(:job, title: 'C++ Developer')
        job2 = build(:job, title: 'C Developer')

        expect(job2).not_to be_valid
        expect(job2.errors.full_messages).to include('Slug has already been taken')
      end

      it 'rejects titles without any letters or digits' do
        job2 = build(:job, title: '!!!')

        expect(job2).not_to be_valid
        expect(job2.errors.full_messages).to include("Slug can't be blank")
      end
    end
  end
end

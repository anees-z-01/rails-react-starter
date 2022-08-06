# Job Applications Workspace

A Rails API and React client for browsing jobs and tracking applications. Jobs and applications have separate status lifecycles; serializers and collection objects keep API responses distinct from persistence.

## Start both applications

```sh
bundle install
bundle exec rake db:create db:migrate db:seed
bundle exec rails server
```

In another terminal:

```sh
cd client
yarn install
yarn start
```

The sample uses SQLite. Check the client's `package.json` proxy and `src/api/baseApi.js` before changing server ports. Use disposable sample accounts, not real candidate information.

## Follow the code

`app/models/job.rb` and `job_application.rb` represent the two lifecycles. API controllers delegate response formatting to serializers; `client/src/pages` contains job browsing, application tracking, and login screens. Client tests cover API and date helpers, while Rails specs live under `spec`.

Run backend checks with `bundle exec rspec` and client checks with `yarn test --watchAll=false`. Before deployment, review authentication, authorization for status changes, database uniqueness, and ownership checks on applications. A useful UI preview shows open jobs and a synthetic applicant's application state.

This code originated as an application exercise. Preserve upstream notices and verify that you have publication rights before using it as a featured portfolio project.

# Airtable managed connectivity source
> A simple IDN connector using Airtable as the backend source

## Getting started

### getting your Airtable base ready
- Create an Airtable account https://airtable.com/
- Copy this Airtable base into your workspace: https://airtable.com/shrjmJYj6teIrvErU
- generate an API key if you don't already have one and record your base id

### creating the source
- Clone this repository
- Install the dependencies `npm install`
- Create your connector `sail conn create "airtable managed connector"`
- Build the connector `npm run pack-zip`
- Upload the connector into your IDN org: `sail conn upload -c {Connector ID} -f dist/airtable-source.zip`
- Your connector will now be availble for use in IDN when you create a new source
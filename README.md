## Starry Night Fullstack Monorepo

A digital showcase of sorts, this repo includes both the FE and the BE.

FE is deployed on vercel. 


## Versions

There are multiple versions of deployment in this repo.

1. AWS BE + Vercel FE
This is the original deployment plan which follows this architecture diagram:


With the BE hosted on an EC2, and the Postgres DB also ran in the same EC2. Originally wanted to do this way with an RDS, but RDS is too costly, hence just running the small DB in the EC2 for a PoC and test.

Springboot BE in EC2 with an Nginx reverse proxy sitting on top of it taking care of SSL cert. Files stored in S3. Postgres DB set up locally in EC2.

Check this out in the AWS branch.

2. Oracle BE + Vercel FE + Supabase 

Same as AWS set up, but ran in Oracle since they offer free VMs forever, and the storage done in Supabase.

This is the free alternative to the AWS setup.

Check this out in the free-tier branch.

3. Vercel FE deployment only

Completely FE with mocked data. This is for in the scenario when BE is unavailable, i.e. Oracle or AWS goes down, then show default events and disable login.


# Planning, Schemas and Architecture Diagram
https://www.notion.so/Full-Application-Stack-Runthrough-285f43d171ee80d08411e5566ba2ed61?source=copy_link

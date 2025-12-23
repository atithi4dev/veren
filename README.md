# VEREN

### Veren is a backend driven deployment system that automates building and deploying application from source repositories using a service-oriented architecture.

## Guides -
[~ Documentation](https://main.veren.site/docs)

[~ API Walkthrough](https://main.veren.site/api-walkthrough)

[~ Fast Setups?](#project-setup)

[~ Buy me a Coffee](https://main.veren.site/cofee)

## Project Setup -

**Clone the repository:**

```bash
git clone <repository-url>
cd veren
``` 

We assume you have already gone through the required configuration and added the necessary files as described in [@essentials](https://github.com/atithi4dev/veren/tree/test/api-gateway) before starting the project.

**Start the services using Docker Compose:**
```bash
docker compose up --build
```
Now you are ready to visit [api-guidelines](https://main.veren.site/docs) to access the differnt routes and supported features. 

## Architecture Overview -

**VEREN** is built as a cloud-native, backend-first deployment platform using a service-oriented architecture:

**API Gateway:** Central entry point for all project and deployment requests.

**Worker Services:** Handle build execution, deployment orchestration, and asynchronous job processing.

**Artifact Storage:** Stores deployment artifacts using cloud storage (S3-compatible).

**Database Layer:** Tracks project metadata, deployment state, and logs.

**Asynchronous Event Flow:** Ensures reliability and observability of deployments across multiple services.

## Contributions -
This project was originally created as a practice and learning exercise and is not actively maintained long-term by the [@owner](https://github.com/atithi4dev) 

That said, contributions are welcome.

As an aspiring developer, there may be design gaps, edge cases, or implementation issues in the system. If you identify areas for improvement or feel something should be added or refined, feel free to open an issue or submit a pull request.

Reasonable changes and improvements will be reviewed and merged when possible, keeping in mind academic and development commitments.

Please follow the [contribution guidelines](#contribution-guidelines) below when opening issues or submitting PRs.

## Contribution Guidelines - 
This project is open to help and suggestions rather than strict contributions.

If you notice something that can be improved, simplified, or fixed, feel free to:

Open an issue

Suggest changes

Submit a pull request (even small ones)

There are no strict rules—clarity and intent matter more than perfection.
Any help or feedback is appreciated

## Support -
Open an [issue](https://github.com/atithi4dev/veren/issues) on the GitHub repository.

Reach out via [email](atithisingh.dev@gmail.com) or project discussion.


</br>
</br>
</br>
</br>
</br>
</br>
</br>



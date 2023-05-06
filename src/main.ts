import * as core from '@actions/core';
import * as github from '@actions/github';
import {getAssigneesFromConfig} from './config';

async function run(): Promise<void> {
	try {
		if (!process.env.GITHUB_REF) throw new Error('missing GITHUB_REF');
		if (!process.env.GITHUB_REPOSITORY)
			throw new Error('missing GITHUB_REPOSITORY');
		const token = core.getInput('repo-token', {required: true});
		const assignees = getAssigneesFromConfig();

		if (assignees.length === 0) {
			core.setFailed('No assignees provided');
			return;
		}

		const client = github.getOctokit(token);
		const {repo, payload} = github.context;

		if (!payload.pull_request) {
			core.setFailed('This action should only run on pull_request events');
			return;
		}

		const prNumber = payload.pull_request.number;

		// Fetch all open pull requests
		const {data: openPRs} = await client.rest.pulls.list({
			owner: repo.owner,
			repo: repo.repo,
			state: 'open'
		});

		// Count the number of assigned pull requests for each user
		const assigneeCounts: {[assignee: string]: number} = {};
		for (const assignee of assignees) {
			assigneeCounts[assignee] = 0;
		}

		for (const pr of openPRs) {
			if (!pr.assignees) continue;
			for (const assignee of pr.assignees) {
				if (
					Object.prototype.hasOwnProperty.call(assigneeCounts, assignee.login)
				) {
					assigneeCounts[assignee.login]++;
				}
			}
		}

		// Find the least assigned count
		const leastAssignedCount = Math.min(...Object.values(assigneeCounts));

		// Get an array of users with the least assigned count
		const leastAssignedUsers = Object.entries(assigneeCounts)
			.filter(([_, count]) => count === leastAssignedCount)
			.map(([user, _]) => user);

		// Choose a random user from the leastAssignedUsers array
		const randomLeastAssignedUser =
			leastAssignedUsers[Math.floor(Math.random() * leastAssignedUsers.length)];

		// Assign the randomly chosen user to the current pull request
		await client.rest.issues.addAssignees({
			owner: repo.owner,
			repo: repo.repo,
			issue_number: prNumber,
			assignees: [randomLeastAssignedUser]
		});

		core.info(
			`Randomly assigned assignee "${randomLeastAssignedUser}" to pull request #${prNumber}`
		);
	} catch (error) {
		core.setFailed(`Action failed with error: ${error}`);
	}
}

run();

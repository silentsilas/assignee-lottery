import * as core from '@actions/core';
import yaml from 'js-yaml';
import fs from 'fs';

export interface Config {
	assignees: string[];
}

export const getAssigneesFromConfig = (): string[] => {
	const configPath = core.getInput('config', {required: true});

	try {
		const config = yaml.load(fs.readFileSync(configPath, 'utf8')) as Config;

		if (!config.assignees) {
			throw new Error('`reviewers` should be set');
		}

		return config.assignees;
	} catch (error) {
		if (error instanceof Error) {
			core.setFailed(error.message);
		} else if (typeof error === 'string') {
			core.setFailed(error);
		} else {
			core.setFailed('An unknown error has occured');
		}
	}

	return [];
};

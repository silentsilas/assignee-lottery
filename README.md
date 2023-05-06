# assignee-lottery
Github Action to randomly assign an assignee to a pull request

This was heavily inspired by [reviewer-lottery](https://github.com/uesteibar/reviewer-lottery). However, it assigns reviewers instead of assignees which don't appear link properly with Jira, and its added complexity to support features that may not be needed made it difficult to extend it.

In your repository, add your configuration in `.github/assignee-lottery.yml`

```yaml
assignees:
  - silentsilas
  - github_user
  - some_other_github_user
```

Now when a pull request is opened in your repository, a random user from that list will be set as an assignee, choosing the user assigned to the least amount of PR's that are already open.
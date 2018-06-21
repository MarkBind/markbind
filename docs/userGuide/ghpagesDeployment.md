<frontmatter>
  footer: userGuideFooter.md
  siteNav: userGuideSections.md
</frontmatter>

<include src="../common/header.md" />

<div class="website-content">

# Github Pages Deployment

`MarkBind` supports auto deployment to Github pages with a single command

```
$ markbind deploy
```

Make sure you have initialize your project as a Github repo and have a remote added to the repo; or please specify the repo link in the `site.json`'s deployment setting.

Learn more about [Github pages](https://help.github.com/categories/github-pages-basics/).

### Deploy to Github pages at `gh-pages` branch of the current repo

By default, if you have set up the current working directory as a git project, and have added the Github remote to the repo, then you are good to deploy. Simply run

```
$ markbind deploy
```

and wait it to finish deploying.

After deployment, your will be able to view your site online at http://*username*.github.io/*repository*.

**Note:** Don't forget to set the `baseUrl` setting in the `site.json` otherwise your deployed website may have issue with link navigation. In the above deployment example, you should set your `baseUrl` to "/*repository*".

### Deployment config in `site.json`

The following deployment config is available in your `site.json`'s "*deploy*" section:
```
"deploy": {
    "message": "Site Update.", // This is the message for the deployment commit
    "repo": "https://github.com/USER/REPO.git", // Or "git@github.com:USER/REPO.git" if you use SSH
    "branch": "gh-pages" // the branch for the deployment, default to 'gh-pages'
}
```

**If you want to use the default setting, remove the config entry or set it to empty string (`''`)**

* `deploy.message`

  This is the commit message used for the deployment commit.    
  (**Default**: Site Update.)

* `deploy.repo`

  This is the repo you want to deploy to. By default MarkBind try to push to the same repo as the current working project. If this is set, MarkBind will deploy to the given repo instead.    
  (**Default**: the current working project's repo)

* `deploy.branch`

  This is the branch that will be deployed to in the remote repo.    
  (**Default**: 'gh-pages')

</div>

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var path = require('path');
var fs = require('fs-extra');
var ghpages = require('gh-pages');
var Site = require('../../src/Site');
var _a = require('./utils/data'), INDEX_MD_DEFAULT = _a.INDEX_MD_DEFAULT, PAGE_NJK = _a.PAGE_NJK, SITE_JSON_DEFAULT = _a.SITE_JSON_DEFAULT, getDefaultTemplateFileFullPath = _a.getDefaultTemplateFileFullPath;
var DEFAULT_TEMPLATE = 'default';
jest.mock('fs');
jest.mock('walk-sync');
jest.mock('gh-pages');
jest.mock('../../src/Page');
jest.mock('../../src/plugins/PluginManager');
jest.mock('simple-git', function () { return function () { return (__assign(__assign({}, jest.requireActual('simple-git')()), { 
    // A test file should reduce dependencies on external libraries; use pure js functions instead.
    // eslint-disable-next-line lodash/prefer-constant
    catFile: jest.fn(function () { return 'mock-test-website.com'; }), 
    // eslint-disable-next-line lodash/prefer-constant
    remote: jest.fn(function () { return 'https://github.com/mockName/mockRepo.git'; }) })); }; });
afterEach(function () { return fs.vol.reset(); });
test('Site Init with invalid template fails', function () { return __awaiter(_this, void 0, void 0, function () {
    var json;
    var _a;
    return __generator(this, function (_b) {
        json = __assign(__assign({}, PAGE_NJK), (_a = {}, _a[getDefaultTemplateFileFullPath('index.md')] = INDEX_MD_DEFAULT, _a));
        fs.vol.fromJSON(json, '');
        Site.initSite('', DEFAULT_TEMPLATE)
            .catch(function (err) {
            expect(err).toEqual(new Error('Template validation failed. Required files does not exist'));
        });
        return [2 /*return*/];
    });
}); });
test('Site Init does not overwrite existing files', function () { return __awaiter(_this, void 0, void 0, function () {
    var EXISTING_INDEX_MD, json;
    var _a;
    return __generator(this, function (_b) {
        EXISTING_INDEX_MD = 'THIS CONTENT SHOULD NOT BE OVERWRITTEN';
        json = __assign(__assign({ 'index.md': EXISTING_INDEX_MD }, PAGE_NJK), (_a = {}, _a[getDefaultTemplateFileFullPath('index.md')] = INDEX_MD_DEFAULT, _a[getDefaultTemplateFileFullPath('site.json')] = SITE_JSON_DEFAULT, _a));
        fs.vol.fromJSON(json, '');
        // index.md
        expect(fs.readFileSync(path.resolve('index.md'), 'utf8')).toEqual(EXISTING_INDEX_MD);
        return [2 /*return*/];
    });
}); });
test('Site baseurls are correct for sub nested subsites', function () { return __awaiter(_this, void 0, void 0, function () {
    var json, baseUrlMapExpected, site;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                json = __assign(__assign({}, PAGE_NJK), { 'site.json': SITE_JSON_DEFAULT, 'sub/site.json': SITE_JSON_DEFAULT, 'sub/sub/site.json': SITE_JSON_DEFAULT, 'otherSub/sub/site.json': SITE_JSON_DEFAULT });
                fs.vol.fromJSON(json, '');
                baseUrlMapExpected = new Set(['', 'sub', 'sub/sub', 'otherSub/sub'].map(function (url) { return path.resolve(url); }));
                site = new Site('./', '_site');
                return [4 /*yield*/, site.readSiteConfig()];
            case 1:
                _a.sent();
                return [4 /*yield*/, site.collectBaseUrl()];
            case 2:
                _a.sent();
                expect(site.baseUrlMap).toEqual(baseUrlMapExpected);
                return [2 /*return*/];
        }
    });
}); });
test('Site removeAsync removes the correct asset', function () { return __awaiter(_this, void 0, void 0, function () {
    var json, site;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                json = __assign(__assign({}, PAGE_NJK), { '_site/toRemove.jpg': '', '_site/dontRemove.png': '', 'toRemove.html': '' });
                fs.vol.fromJSON(json, '');
                site = new Site('./', '_site');
                return [4 /*yield*/, site.removeAsset('toRemove.jpg')];
            case 1:
                _a.sent();
                expect(fs.existsSync(path.resolve('_site/toRemove.jpg'))).toEqual(false);
                expect(fs.existsSync(path.resolve('_site/dontRemove.png'))).toEqual(true);
                return [2 /*return*/];
        }
    });
}); });
test('Site read site config for default', function () { return __awaiter(_this, void 0, void 0, function () {
    var json, expectedSiteConfigDefaults, expectedSiteConfig, site, siteConfig;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                json = __assign(__assign({}, PAGE_NJK), { 'site.json': SITE_JSON_DEFAULT });
                fs.vol.fromJSON(json, '');
                expectedSiteConfigDefaults = { enableSearch: true };
                expectedSiteConfig = __assign(__assign({}, JSON.parse(SITE_JSON_DEFAULT)), expectedSiteConfigDefaults);
                site = new Site('./', '_site');
                return [4 /*yield*/, site.readSiteConfig()];
            case 1:
                siteConfig = _a.sent();
                expect(siteConfig.baseUrl).toEqual(expectedSiteConfig.baseUrl);
                expect(siteConfig.titlePrefix).toEqual(expectedSiteConfig.titlePrefix);
                expect(siteConfig.ignore).toEqual(expectedSiteConfig.ignore);
                expect(siteConfig.pages).toEqual(expectedSiteConfig.pages);
                expect(siteConfig.deploy).toEqual(expectedSiteConfig.deploy);
                expect(siteConfig.enableSearch).toEqual(expectedSiteConfig.enableSearch);
                return [2 /*return*/];
        }
    });
}); });
test('Site read site config for custom site config', function () { return __awaiter(_this, void 0, void 0, function () {
    var customSiteJson, json, site, siteConfig;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                customSiteJson = {
                    baseUrl: '',
                    pages: [
                        {
                            src: 'index.md',
                            title: 'My Markbind Website',
                        },
                    ],
                    ignore: [
                        '_site/*',
                        '*.json',
                        '*.md',
                    ],
                    deploy: {
                        message: 'Site Update.',
                    },
                    enableSearch: true,
                };
                json = __assign(__assign({}, PAGE_NJK), { 'site.json': JSON.stringify(customSiteJson) });
                fs.vol.fromJSON(json, '');
                site = new Site('./', '_site');
                return [4 /*yield*/, site.readSiteConfig()];
            case 1:
                siteConfig = _a.sent();
                expect(siteConfig.baseUrl).toEqual(customSiteJson.baseUrl);
                expect(siteConfig.pages).toEqual(customSiteJson.pages);
                expect(siteConfig.ignore).toEqual(customSiteJson.ignore);
                expect(siteConfig.deploy).toEqual(customSiteJson.deploy);
                expect(siteConfig.enableSearch).toEqual(customSiteJson.enableSearch);
                return [2 /*return*/];
        }
    });
}); });
test('Site resolves variables referencing other variables', function () { return __awaiter(_this, void 0, void 0, function () {
    var json, site, root, expectedTextSpan;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                json = __assign(__assign({}, PAGE_NJK), { 'site.json': SITE_JSON_DEFAULT, '_markbind/variables.md': '<variable name="level1">variable</variable>'
                        + '<variable name="level2">{{level1}}</variable>'
                        + '<variable name="level3"><span style="color: blue">Blue text</span></variable>'
                        + '<variable name="level4">{{level3}}</variable>' });
                fs.vol.fromJSON(json, '');
                site = new Site('./', '_site');
                return [4 /*yield*/, site.readSiteConfig()];
            case 1:
                _a.sent();
                return [4 /*yield*/, site.collectBaseUrl()];
            case 2:
                _a.sent();
                return [4 /*yield*/, site.collectUserDefinedVariablesMap()];
            case 3:
                _a.sent();
                root = site.variableProcessor.userDefinedVariablesMap[path.resolve('')];
                // check all variables
                expect(root.level1).toEqual('variable');
                expect(root.level2).toEqual('variable');
                expectedTextSpan = '<span style="color: blue">Blue text</span>';
                expect(root.level3).toEqual(expectedTextSpan);
                expect(root.level4).toEqual(expectedTextSpan);
                return [2 /*return*/];
        }
    });
}); });
test('Site read correct user defined variables', function () { return __awaiter(_this, void 0, void 0, function () {
    var json, site, root, sub, subsub, othersub;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                json = __assign(__assign({}, PAGE_NJK), { 'site.json': SITE_JSON_DEFAULT, 'sub/site.json': SITE_JSON_DEFAULT, 'sub/sub/site.json': SITE_JSON_DEFAULT, 'otherSub/sub/site.json': SITE_JSON_DEFAULT, '_markbind/variables.md': '<variable name="variable">variable</variable>'
                        + '<variable name="number">2</variable>', 'sub/_markbind/variables.md': '<variable name="variable">sub_variable</variable>', 'sub/sub/_markbind/variables.md': '<variable name="number">9999</variable>', 'otherSub/sub/_markbind/variables.md': '<variable name="variable">other_variable</variable>' });
                fs.vol.fromJSON(json, '');
                site = new Site('./', '_site');
                return [4 /*yield*/, site.readSiteConfig()];
            case 1:
                _a.sent();
                return [4 /*yield*/, site.collectBaseUrl()];
            case 2:
                _a.sent();
                return [4 /*yield*/, site.collectUserDefinedVariablesMap()];
            case 3:
                _a.sent();
                root = site.variableProcessor.userDefinedVariablesMap[path.resolve('')];
                sub = site.variableProcessor.userDefinedVariablesMap[path.resolve('sub')];
                subsub = site.variableProcessor.userDefinedVariablesMap[path.resolve('sub/sub')];
                othersub = site.variableProcessor.userDefinedVariablesMap[path.resolve('otherSub/sub')];
                // check all baseUrls
                expect(root.baseUrl).toEqual('');
                expect(sub.baseUrl).toEqual('/sub');
                expect(subsub.baseUrl).toEqual('/sub/sub');
                expect(othersub.baseUrl).toEqual('/otherSub/sub');
                // check other variables
                expect(root.variable).toEqual('variable');
                expect(root.number).toEqual('2');
                expect(sub.variable).toEqual('sub_variable');
                expect(othersub.variable).toEqual('other_variable');
                expect(subsub.number).toEqual('9999');
                return [2 /*return*/];
        }
    });
}); });
test('Site deploys with default settings', function () { return __awaiter(_this, void 0, void 0, function () {
    var json, site;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                json = __assign(__assign({}, PAGE_NJK), { 'site.json': SITE_JSON_DEFAULT, _site: {} });
                fs.vol.fromJSON(json, '');
                site = new Site('./', '_site');
                return [4 /*yield*/, site.deploy()];
            case 1:
                _a.sent();
                expect(ghpages.dir).toEqual('_site');
                expect(ghpages.options)
                    .toEqual({
                    branch: 'gh-pages',
                    message: 'Site Update.',
                    repo: '',
                    remote: 'origin',
                });
                return [2 /*return*/];
        }
    });
}); });
test('Site deploys with custom settings', function () { return __awaiter(_this, void 0, void 0, function () {
    var customConfig, json, site;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                customConfig = JSON.parse(SITE_JSON_DEFAULT);
                customConfig.deploy = {
                    message: 'Custom Site Update.',
                    repo: 'https://github.com/USER/REPO.git',
                    branch: 'master',
                };
                json = __assign(__assign({}, PAGE_NJK), { 'site.json': JSON.stringify(customConfig), _site: {} });
                fs.vol.fromJSON(json, '');
                site = new Site('./', '_site');
                return [4 /*yield*/, site.deploy()];
            case 1:
                _a.sent();
                expect(ghpages.dir).toEqual('_site');
                expect(ghpages.options)
                    .toEqual({
                    branch: 'master',
                    message: 'Custom Site Update.',
                    repo: 'https://github.com/USER/REPO.git',
                    remote: 'origin',
                });
                return [2 /*return*/];
        }
    });
}); });
test('Site should not deploy without a built site', function () { return __awaiter(_this, void 0, void 0, function () {
    var json, site;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                json = __assign(__assign({}, PAGE_NJK), { 'site.json': SITE_JSON_DEFAULT });
                fs.vol.fromJSON(json, '');
                site = new Site('./', '_site');
                return [4 /*yield*/, expect(site.deploy())
                        .rejects
                        .toThrow(new Error('The site directory does not exist. '
                        + 'Please build the site first before deploy.'))];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
describe('Site deploy with Travis', function () {
    // Keep a copy of the original environment as we need to modify it for deploy Travis tests
    var OLD_ENV = __assign({}, process.env);
    beforeEach(function () {
        // Delete all environment variables that affect tests
        delete process.env.TRAVIS;
        delete process.env.GITHUB_TOKEN;
        delete process.env.TRAVIS_REPO_SLUG;
    });
    afterAll(function () {
        // Restore the original environment at the end of deploy Travis tests
        process.env = __assign({}, OLD_ENV);
    });
    test('Site deploy -t/--travis deploys with default settings', function () { return __awaiter(_this, void 0, void 0, function () {
        var json, site;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    process.env.TRAVIS = true;
                    process.env.GITHUB_TOKEN = 'githubToken';
                    process.env.TRAVIS_REPO_SLUG = 'TRAVIS_USER/TRAVIS_REPO';
                    json = __assign(__assign({}, PAGE_NJK), { 'site.json': SITE_JSON_DEFAULT, _site: {} });
                    fs.vol.fromJSON(json, '');
                    site = new Site('./', '_site');
                    return [4 /*yield*/, site.deploy(true)];
                case 1:
                    _a.sent();
                    expect(ghpages.options.repo)
                        .toEqual("https://" + process.env.GITHUB_TOKEN + "@github.com/" + process.env.TRAVIS_REPO_SLUG + ".git");
                    expect(ghpages.options.user).toEqual({ name: 'Deployment Bot', email: 'deploy@travis-ci.org' });
                    return [2 /*return*/];
            }
        });
    }); });
    test('Site deploy -t/--travis deploys with custom GitHub repo', function () { return __awaiter(_this, void 0, void 0, function () {
        var customRepoConfig, json, site;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    process.env.TRAVIS = true;
                    process.env.GITHUB_TOKEN = 'githubToken';
                    process.env.TRAVIS_REPO_SLUG = 'TRAVIS_USER/TRAVIS_REPO.git';
                    customRepoConfig = JSON.parse(SITE_JSON_DEFAULT);
                    customRepoConfig.deploy.repo = 'https://github.com/USER/REPO.git';
                    json = __assign(__assign({}, PAGE_NJK), { 'site.json': JSON.stringify(customRepoConfig), _site: {} });
                    fs.vol.fromJSON(json, '');
                    site = new Site('./', '_site');
                    return [4 /*yield*/, site.deploy(true)];
                case 1:
                    _a.sent();
                    expect(ghpages.options.repo)
                        .toEqual("https://" + process.env.GITHUB_TOKEN + "@github.com/USER/REPO.git");
                    return [2 /*return*/];
            }
        });
    }); });
    test('Site deploy -t/--travis deploys to correct repo when .git is in repo name', function () { return __awaiter(_this, void 0, void 0, function () {
        var json, site;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    process.env.TRAVIS = true;
                    process.env.GITHUB_TOKEN = 'githubToken';
                    process.env.TRAVIS_REPO_SLUG = 'TRAVIS_USER/TRAVIS_REPO.github.io';
                    json = __assign(__assign({}, PAGE_NJK), { 'site.json': SITE_JSON_DEFAULT, _site: {} });
                    fs.vol.fromJSON(json, '');
                    site = new Site('./', '_site');
                    return [4 /*yield*/, site.deploy(true)];
                case 1:
                    _a.sent();
                    expect(ghpages.options.repo)
                        .toEqual("https://" + process.env.GITHUB_TOKEN + "@github.com/TRAVIS_USER/TRAVIS_REPO.github.io.git");
                    return [2 /*return*/];
            }
        });
    }); });
    test('Site deploy -t/--travis should not deploy if not in Travis', function () { return __awaiter(_this, void 0, void 0, function () {
        var json, site;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    json = __assign(__assign({}, PAGE_NJK), { 'site.json': SITE_JSON_DEFAULT, _site: {} });
                    fs.vol.fromJSON(json, '');
                    site = new Site('./', '_site');
                    return [4 /*yield*/, expect(site.deploy(true))
                            .rejects
                            .toThrow(new Error('-t/--travis should only be run in Travis CI.'))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('Site deploy -t/--travis should not deploy without authentication token', function () { return __awaiter(_this, void 0, void 0, function () {
        var json, site;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    process.env.TRAVIS = true;
                    json = __assign(__assign({}, PAGE_NJK), { 'site.json': SITE_JSON_DEFAULT, _site: {} });
                    fs.vol.fromJSON(json, '');
                    site = new Site('./', '_site');
                    return [4 /*yield*/, expect(site.deploy(true))
                            .rejects
                            .toThrow(new Error('The environment variable GITHUB_TOKEN does not exist.'))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('Site deploy -t/--travis should not deploy if custom repository is not on GitHub', function () { return __awaiter(_this, void 0, void 0, function () {
        var invalidRepoConfig, json, site;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    process.env.TRAVIS = true;
                    process.env.GITHUB_TOKEN = 'githubToken';
                    invalidRepoConfig = JSON.parse(SITE_JSON_DEFAULT);
                    invalidRepoConfig.deploy.repo = 'INVALID_GITHUB_REPO';
                    json = __assign(__assign({}, PAGE_NJK), { 'site.json': JSON.stringify(invalidRepoConfig), _site: {} });
                    fs.vol.fromJSON(json, '');
                    site = new Site('./', '_site');
                    return [4 /*yield*/, expect(site.deploy(true))
                            .rejects
                            .toThrow(new Error('-t/--travis expects a GitHub repository.\n'
                            + ("The specified repository " + invalidRepoConfig.deploy.repo + " is not valid.")))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
var siteJsonResolvePropertiesTestCases = [
    {
        name: 'Site.json merge page and glob properties',
        pages: [
            {
                src: 'index.md',
                title: 'Title',
            },
            {
                glob: '*.md',
                layout: 'Layout',
            },
        ],
        expected: [
            {
                src: 'index.md',
                searchable: undefined,
                layout: 'Layout',
                title: 'Title',
            },
        ],
    },
    {
        name: 'Site.json merge glob properties',
        pages: [
            {
                glob: '*.md',
                layout: 'Layout',
            },
            {
                glob: '*.md',
                searchable: false,
            },
        ],
        expected: [
            {
                src: 'index.md',
                searchable: false,
                layout: 'Layout',
            },
        ],
    },
    {
        name: 'Site.json page has priority over glob',
        pages: [
            {
                glob: '*.md',
                layout: 'Wrong',
            },
            {
                src: 'index.md',
                layout: 'Layout',
            },
            {
                glob: '*.md',
                layout: 'Wrong',
            },
        ],
        expected: [
            {
                src: 'index.md',
                searchable: undefined,
                layout: 'Layout',
            },
        ],
    },
    {
        name: 'Site.json glob latest match has priority',
        pages: [
            {
                glob: '*.md',
                layout: 'Wrong',
                searchable: false,
            },
            {
                glob: '*.md',
                layout: 'Layout',
                searchable: true,
            },
        ],
        expected: [
            {
                src: 'index.md',
                searchable: true,
                layout: 'Layout',
            },
        ],
    },
];
siteJsonResolvePropertiesTestCases.forEach(function (testCase) {
    test(testCase.name, function () { return __awaiter(_this, void 0, void 0, function () {
        var customSiteConfig, json, site;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    customSiteConfig = {
                        baseUrl: '',
                        pages: testCase.pages,
                        pagesExclude: [],
                        ignore: [
                            '_site/*',
                            '*.json',
                            '*.md',
                        ],
                        deploy: {
                            message: 'Site Update.',
                        },
                    };
                    json = __assign(__assign({}, PAGE_NJK), { 'index.md': '' });
                    fs.vol.fromJSON(json, '');
                    site = new Site('./', '_site');
                    site.siteConfig = customSiteConfig;
                    return [4 /*yield*/, site.collectAddressablePages()];
                case 1:
                    _a.sent();
                    expect(site.addressablePages)
                        .toEqual(testCase.expected);
                    return [2 /*return*/];
            }
        });
    }); });
});
test('Site config throws error on duplicate page src', function () { return __awaiter(_this, void 0, void 0, function () {
    var customSiteConfig, json, site;
    return __generator(this, function (_a) {
        customSiteConfig = {
            baseUrl: '',
            pages: [
                {
                    src: 'index.md',
                    layout: 'Layout',
                },
                {
                    src: 'index.md',
                    title: 'Title',
                },
            ],
            ignore: [
                '_site/*',
                '*.json',
                '*.md',
            ],
            deploy: {
                message: 'Site Update.',
            },
        };
        json = __assign(__assign({}, PAGE_NJK), { 'index.md': '' });
        fs.vol.fromJSON(json, '');
        site = new Site('./', '_site');
        site.siteConfig = customSiteConfig;
        expect(site.collectAddressablePages())
            .rejects
            .toThrow(new Error('Duplicate page entries found in site config: index.md'));
        return [2 /*return*/];
    });
}); });
var siteJsonPageExclusionTestCases = [
    {
        name: 'Site.json excludes pages by glob exclude',
        pages: [
            {
                glob: '*.md',
                globExclude: ['exclude.md'],
            },
        ],
        expected: [
            {
                src: 'index.md',
            },
        ],
    },
    {
        name: 'Site.json excludes pages by pages exclude',
        pages: [
            {
                glob: '*.md',
            },
        ],
        pagesExclude: ['exclude.md'],
        expected: [
            {
                src: 'index.md',
            },
        ],
    },
    {
        name: 'Site.json excludes pages by combination of pages exclude and glob exclude',
        pages: [
            {
                glob: '*.md',
                globExclude: ['exclude.md'],
            },
        ],
        pagesExclude: ['index.md'],
        expected: [],
    },
];
siteJsonPageExclusionTestCases.forEach(function (testCase) {
    test(testCase.name, function () { return __awaiter(_this, void 0, void 0, function () {
        var customSiteConfig, json, site;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    customSiteConfig = {
                        baseUrl: '',
                        pages: testCase.pages,
                        pagesExclude: testCase.pagesExclude || [],
                        ignore: [
                            '_site/*',
                            '*.json',
                            '*.md',
                        ],
                        deploy: {
                            message: 'Site Update.',
                        },
                    };
                    json = __assign(__assign({}, PAGE_NJK), { 'index.md': '', 'exclude.md': '' });
                    fs.vol.fromJSON(json, '');
                    site = new Site('./', '_site');
                    site.siteConfig = customSiteConfig;
                    return [4 /*yield*/, site.collectAddressablePages()];
                case 1:
                    _a.sent();
                    expect(site.addressablePages)
                        .toEqual(testCase.expected);
                    return [2 /*return*/];
            }
        });
    }); });
});

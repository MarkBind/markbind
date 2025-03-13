import { Page } from '../../../src/Page/index';
import { PageConfig } from '../../../src/Page/PageConfig';
import { SiteConfig } from '../../../src/Site/SiteConfig';

const mockPageConfigArgs = {} as ConstructorParameters<typeof PageConfig>[0];

jest.mock('../../../src/Page/PageConfig', () => ({
  PageConfig: jest.fn().mockImplementation(() => (
    // You can customize the behavior of the mock constructor here
    {
      asset: {
        fontAwesome: 'mock-fontawesome.css',
        glyphicons: 'mock-glyphicons.css',
        octicons: 'mock-octicons.css',
        materialIcons: 'mock-materialIcons.css',
      },
    }
  )),
}));

test('should filter out all but font-awesome stylesheet', () => {
  const mockPageConfig = new PageConfig(mockPageConfigArgs);
  const mockPage = new Page(mockPageConfig, {} as SiteConfig);

  mockPage.filterIconAssets(
    '<div><span class="fa-solid"></span></div>',
    '',
  );

  expect(mockPage.asset.fontAwesome).toBeDefined();
  expect(mockPage.asset.glyphicons).toBeUndefined();
  expect(mockPage.asset.octicons).toBeUndefined();
  expect(mockPage.asset.materialIcons).toBeUndefined();
});

test('should filter out all but glyphicon stylesheet', () => {
  const mockPageConfig = new PageConfig(mockPageConfigArgs);
  const mockPage = new Page(mockPageConfig, {} as SiteConfig);

  mockPage.filterIconAssets(
    '<div><span class="glyphicon glyphicon-alert"></span></div>',
    '',
  );

  expect(mockPage.asset.glyphicons).toBeDefined();
  expect(mockPage.asset.fontAwesome).toBeUndefined();
  expect(mockPage.asset.octicons).toBeUndefined();
  expect(mockPage.asset.materialIcons).toBeUndefined();
});

test('should filter out all but octicon stylesheet', () => {
  const mockPageConfig = new PageConfig(mockPageConfigArgs);
  const mockPage = new Page(mockPageConfig, {} as SiteConfig);

  mockPage.filterIconAssets(
    '<div><span class="octicon octicon-git-pull-request"></span></div>',
    '',
  );

  expect(mockPage.asset.octicons).toBeDefined();
  expect(mockPage.asset.fontAwesome).toBeUndefined();
  expect(mockPage.asset.glyphicons).toBeUndefined();
  expect(mockPage.asset.materialIcons).toBeUndefined();
});

test('should filter out all but material-icons stylesheet', () => {
  const mockPageConfig = new PageConfig(mockPageConfigArgs);
  const mockPage = new Page(mockPageConfig, {} as SiteConfig);

  mockPage.filterIconAssets(
    '<div><span class="material-icons-round"></span></div>',
    '',
  );

  expect(mockPage.asset.materialIcons).toBeDefined();
  expect(mockPage.asset.fontAwesome).toBeUndefined();
  expect(mockPage.asset.glyphicons).toBeUndefined();
  expect(mockPage.asset.octicons).toBeUndefined();
});

test('should filter out all stylesheets', () => {
  const mockPageConfig = new PageConfig(mockPageConfigArgs);
  const mockPage = new Page(mockPageConfig, {} as SiteConfig);

  mockPage.filterIconAssets(
    '<div></div>',
    '',
  );

  expect(mockPage.asset.materialIcons).toBeUndefined();
  expect(mockPage.asset.fontAwesome).toBeUndefined();
  expect(mockPage.asset.glyphicons).toBeUndefined();
  expect(mockPage.asset.octicons).toBeUndefined();
});

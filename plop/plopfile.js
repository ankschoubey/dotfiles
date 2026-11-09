export default function (plop) {
  plop.setGenerator('component', {
    prompts: [],
    actions: (data) => [
      {
        type: 'add',
        path: `${data.directory}/{{pascalCase name}}.tsx`,
        templateFile: 'templates/component.tsx.hbs',
      },
      {
        type: 'add',
        path: `${data.directory}/{{pascalCase name}}.stories.tsx`,
        templateFile: 'templates/component.stories.tsx.hbs',
      },
      {
        type: 'add',
        path: `${data.directory}/{{pascalCase name}}.po.ts`,
        templateFile: 'templates/component.po.ts.hbs',
      },
      {
        type: 'add',
        path: `${data.directory}/{{pascalCase name}}.page.ts`,
        templateFile: 'templates/component.page.ts.hbs',
      },
      {
        type: 'add',
        path: `${data.directory}/{{pascalCase name}}.testdata.ts`,
        templateFile: 'templates/component.testdata.ts.hbs',
      },
    ],
  })
}

# SpicyJS Router

SpicyJS is a buildless microframework that consists of a few tiny packages. Like all spicy packages, the router can be used without the other packages.

- @spicyjs/core: a JS library that takes the pain out of creating, updating, and attaching listeners to elements.
- @spicyjs/reactor: a Reactive library that binds data to nodes
- @spicyjs/router: a lightweight router for SPA's

## Why

When developing web applications, its often a better experience to refresh only a portion of the page, creating an SPA. This router aims to be small and will get smaller as new navigation oriented browser APIs are adopted.

## Installation

```bash
npm i @spicyjs/router
```

## Usage

```js
import { createRouter, go, beforeEach, afterEach, getCurrentRoute } from "@spicyjs/router";

const outlet = document.createElement('div');
outlet.className = 'router-outlet'
document.body.append(outlet);

beforeEach(async () => {
	await checkSomething();
	//display a loading indicator
})

afterEach(() => {
	//hide the loading indicator
})

//create the router
await router.createRouter([
	{
		name: "default",
		path: "/",
		handler: async () => {
			await importantStuff();
			return document.createElement('div');
		},
	},
	{
		target: '.a-selector',//defaults to .router-outlet, this can also be an element or a function that returns an element
		name: "about",
		path: "/about/:id",
		handler: (params, query) => document.createElement('span'),
		before: () => {
			if(!loggedIn) {
				router.go({ name: 'default' })
				return false;
			}
		},
		after: () => {
			console.log('you navigated, yay!')
		}
	},
]);

//navigation
await go({ name: "about", params: { id: "123" }, query: { search: "bob" } });
await go({ path: "/" );
```

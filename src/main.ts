import "./style.css";
import { createRouter, go } from ".";

const RouteAnchor = (routeParam: Parameters<typeof go>[0], text: string) => {
	const a = document.createElement("a");
	a.textContent = text;
	a.addEventListener("click", ($event) => {
		$event.preventDefault();
		go(routeParam);
	});
	return a;
};

createRouter([
	{
		path: "/",
		name: "default",
		handler: () => {
			const div = document.createElement("div");
			div.textContent = "default route";
			div.appendChild(RouteAnchor({ name: "about" }, "Go"));
			return div;
		},
	},
	{
		path: "/about",
		name: "about",
		handler: () => {
			const div = document.createElement("div");
			div.textContent = "about route";
			const detailsDiv = document.createElement("div");
			detailsDiv.className = "about-details";
			const aboutMeLink = RouteAnchor({ name: "about-me" }, "About me");
			const aboutYouLink = RouteAnchor({ name: "about-you" }, "About you");
			div.append(aboutMeLink, aboutYouLink, detailsDiv);
			return div;
		},
		children: [
			{
				name: "about-me",
				path: "/me",
				target: ".about-details",
				handler() {
					const div = document.createElement("div");
					div.textContent = "about me section";
					return div;
				},
			},
			{
				name: "about-you",
				path: "/you",
				target: ".about-details",
				handler() {
					const div = document.createElement("div");
					div.textContent = "about you section";
					return div;
				},
			},
		],
	},
]);

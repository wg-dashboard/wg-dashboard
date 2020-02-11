import React from "react";
import Head from "next/head";
import Document, {Main, NextScript} from "next/document";
import {ServerStyleSheets} from "@material-ui/core/styles";

import sideNav from "../components/sideNav";

/**
 * Shamelessly ripped from the official next.js repository for integrating styled components
 * https://github.com/zeit/next.js/blob/master/examples/with-styled-components/pages/_app.js
 */
export default class RenderedDocument extends Document {
	public static async getInitialProps(context: any) {
		// Resolution order
		//
		// On the server:
		// 1. app.getInitialProps
		// 2. page.getInitialProps
		// 3. document.getInitialProps
		// 4. app.render
		// 5. page.render
		// 6. document.render
		//
		// On the server with error:
		// 1. document.getInitialProps
		// 2. app.render
		// 3. page.render
		// 4. document.render
		//
		// On the client
		// 1. app.getInitialProps
		// 2. page.getInitialProps
		// 3. app.render
		// 4. page.render

		// Render app and page and get the context of the page with collected side effects.
		const sheets = new ServerStyleSheets();
		const originalRenderPage = context.renderPage;

		context.renderPage = () =>
			originalRenderPage({
				// App capitalized for JSX
				enhanceApp: (App: any) => (props: any) => sheets.collect(<App {...props} />),
			});

		const initialProps = await Document.getInitialProps(context);

		return {
			...initialProps,
			// styles fragment is rendered after the app and page rendering finish.
			styles: [...React.Children.toArray(initialProps.styles), sheets.getStyleElement()],
		};
	}

	/**
	 * Renders default document page
	 */
	public render(): JSX.Element {
		return (
			<html lang="en">
				<Head>
					<title>WG-Dashboard</title>
					<meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</html>
		);
	}
}

import React from "react";
import App from "next/app";
import CssBaseline from "@material-ui/core/CssBaseline";
import {createMuiTheme, ThemeProvider} from "@material-ui/core/styles";

const theme = createMuiTheme({
	palette: {
		primary: {
			main: "#2d619b",
			contrastText: "#fff",
		},
		secondary: {
			light: "#ff7961",
			main: "#f44336",
			dark: "#ba000d",
			contrastText: "#000",
		},
	},
});

/**
 * Shamelessly ripped from the official next.js repository for integrating styled components
 * https://github.com/zeit/next.js/blob/master/examples/with-styled-components/pages/_app.js
 */
export default class DashboardApp extends App {
	/**
	 * Executed on the client
	 */
	public componentDidMount() {
		// remove the server-side injected CSS.
		const jssStyles = document.querySelector("#jss-server-side");
		jssStyles?.parentElement?.removeChild(jssStyles);
	}

	public render() {
		const {Component, pageProps} = this.props;

		return (
			<ThemeProvider theme={theme}>
				{/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
				<CssBaseline />
				<Component {...pageProps} />
			</ThemeProvider>
		);
	}
}

import React, {Component} from "react";
import {BrowserRouter as Router, Switch, Route} from "react-router-dom";
import {CssBaseline} from "@material-ui/core";
import {observer} from "mobx-react";

import {getCookie} from "./utils";
import Backdrop from "./components/backdrop";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Peers from "./pages/peers";
import Users from "./pages/users";
import states from "./states/index";
import Layout from "./components/layout";

@observer
class App extends Component {
	componentDidMount() {
		const existingUserData = getCookie("userData");

		// ugly check for j:null because we're setting it serverside to "null" if cookie is expired
		if (existingUserData && existingUserData !== "j:null") {
			try {
				const data = JSON.parse(existingUserData);

				if (data.loggedIn) {
					states.user.setLoggedIn(true);
					states.user.setId(data.id);

					// we only need to set admin if we're logged in
					if (data.admin) {
						states.user.setAdmin(true);
					}
				}
			} catch (e) {
				states.user.setLoggedIn(false);
			}
		}
	}

	render() {
		return (
			<Router>
				<CssBaseline />
				<Backdrop />
				<Switch>
					<Route path="/">
						{states.user.loggedIn ? (
							<Layout>
								<Route path="/peers">
									<Peers />
								</Route>
								<Route path="/users">
									<Users />
								</Route>
								<Route path="\/(dashboard)?">
									<Dashboard />
								</Route>
							</Layout>
						) : (
							<Login />
						)}
					</Route>
				</Switch>
			</Router>
		);
	}
}

export default App;

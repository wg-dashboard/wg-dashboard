import React, {Component} from "react";
import {BrowserRouter as Router, Switch, Route} from "react-router-dom";
import {CssBaseline} from "@material-ui/core";
import {observer} from "mobx-react";

import {getCookie} from "./utils";
import Backdrop from "./components/backdrop";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
// import Peers from "./pages/peers";
import Users from "./pages/users";
import states from "./states/index";
import Layout from "./components/layout";

@observer
class App extends Component {
	componentDidMount() {
		const existingUserData = getCookie("userData");

		if (existingUserData) {
			try {
				const data = JSON.parse(existingUserData);

				if (data.loggedIn) {
					states.user.setLoggedIn(true);

					if (data.admin) {
						states.user.setAdmin(true);
					}
				}
			} catch (e) {
				console.error(e);
				console.log("No valid existing userData found..");
			}
		}
	}

	render() {
		return (
			<Router>
				<CssBaseline />
				<Backdrop />
				<Switch>
					<Layout>
						<Route path="/users">
							<Users />
						</Route>
						<Route path="/peers"></Route>
					</Layout>
					<Route path="/">{states.user.loggedIn ? <Dashboard /> : <Login />}</Route>
				</Switch>
			</Router>
		);
	}
}

export default App;

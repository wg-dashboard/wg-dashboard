import React from "react";

import {AppBar, Toolbar, Typography} from "@material-ui/core";
import {Drawer, Divider, List, ListItem, ListItemText, ListSubheader, makeStyles} from "@material-ui/core";

import ActiveLink from "./activeLink";
import {logout} from "../api";

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
	},
	appBar: {
		width: `calc(100% - ${drawerWidth}px)`,
		marginLeft: drawerWidth,
	},
	drawer: {
		width: drawerWidth,
		flexShrink: 0,
	},
	drawerPaper: {
		width: drawerWidth,
	},
	toolbar: {
		textAlign: "center",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		...theme.mixins.toolbar,
	},
	content: {
		flexGrow: 1,
		backgroundColor: theme.palette.background.default,
		padding: theme.spacing(3),
	},
}));

const Layout = (props: any) => {
	const classes = useStyles();

	return (
		<div className={classes.root}>
			<AppBar position="fixed" className={classes.appBar}>
				<Toolbar>
					<Typography variant="h6" noWrap>
						something something
					</Typography>
				</Toolbar>
			</AppBar>
			<Drawer
				className={classes.drawer}
				variant="permanent"
				classes={{
					paper: classes.drawerPaper,
				}}
				anchor="left"
			>
				<div className={classes.toolbar}>
					<Typography variant="overline" noWrap>
						wg-dashboard
					</Typography>
				</div>
				<Divider />
				<List>
					<ListSubheader>Pages</ListSubheader>
					<ActiveLink href="/dashboard">Dashboard</ActiveLink>
					<ActiveLink href="/peers">Peers</ActiveLink>
					<ActiveLink href="/users">Users</ActiveLink>
					<ListSubheader>Actions</ListSubheader>
					<ListItem button onClick={() => logout()}>
						<ListItemText>Logout</ListItemText>
					</ListItem>
				</List>
			</Drawer>
			<main className={classes.content}>
				<div className={classes.toolbar} />
				<div className="container">{props.children}</div>
			</main>
		</div>
	);
};

export default Layout;

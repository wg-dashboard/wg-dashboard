import React from "react";

import {Backdrop, CircularProgress} from "@material-ui/core";
import {makeStyles, createStyles, Theme} from "@material-ui/core/styles";
import {observer} from "mobx-react";

import states from "../states/index";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		backdrop: {
			zIndex: theme.zIndex.drawer + 1,
			color: "#fff",
		},
	})
);

export default observer(() => {
	const classes = useStyles();

	return (
		<Backdrop className={classes.backdrop} open={states.user.pageIsLoading}>
			<CircularProgress color="inherit" />
		</Backdrop>
	);
});

import React from "react";
import {Button} from "@material-ui/core";
import {SnackbarProvider, VariantType, useSnackbar} from "notistack";

function Snack() {
	const {enqueueSnackbar} = useSnackbar();
	const handleClickVariant = (variant: VariantType, message: string) => () => {
		enqueueSnackbar(message, {variant});
	};

	return (
		<React.Fragment>
			<Button onClick={handleClickVariant("error", "Test error message")}>OH NOE</Button>
		</React.Fragment>
	);
}

export default () => {
	return (
		<SnackbarProvider maxSnack={5}>
			<Snack />
		</SnackbarProvider>
	);
};

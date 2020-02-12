import React from "react";

import {ListItem, ListItemText} from "@material-ui/core";
import {Link} from "react-router-dom";

function ActiveLink({children, href}: {children: any; href: any}) {
	return (
		<ListItem button component={Link} to={href}>
			<ListItemText>{children}</ListItemText>
		</ListItem>
	);
}

export default ActiveLink;

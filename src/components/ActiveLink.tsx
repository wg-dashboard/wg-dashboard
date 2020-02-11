import {ListItem, ListItemText} from "@material-ui/core";
import {useRouter} from "next/router";

function ActiveLink({children, href}: {children: any; href: any}) {
	const router = useRouter();

	const handleClick = (e: any) => {
		e.preventDefault();
		router.push(href);
	};

	return (
		<ListItem button href={href} onClick={handleClick} selected={router.pathname === href ? true : false}>
			<ListItemText>{children}</ListItemText>
		</ListItem>
	);
}

export default ActiveLink;

import {useState} from "react";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Login from "../components/loginForm";

export default () => {
	const [loggingIn, setLoggingIn] = useState(true);
	const [tab, setTab] = useState(0);

	const changeTab = (event: React.ChangeEvent<{}>, newTab: number) => {
		setTab(newTab);
	};

	return (
		<Grid container direction="row" justify="center" alignItems="center" style={{minHeight: "100vh"}}>
			<Card style={{maxWidth: "340px"}}>
				<Grid container direction="row" justify="center" alignItems="center">
					<CardMedia
						component="img"
						style={{width: "150px"}}
						alt="wg-dashboard"
						src="/_next/static/wg-dashboard-logo-no-text.png"
						title="wg-dashboard"
					/>
				</Grid>
				<CardActionArea style={{backgroundColor: "#2d619b", padding: "0 16px", color: "#fff"}}>
					<Typography gutterBottom variant="h4" color="inherit" component="h1" style={{textAlign: "center", paddingTop: "14px"}}>
						wg-dashboard
					</Typography>
				</CardActionArea>

				<Paper style={{borderRadius: "0%"}}>
					<Tabs centered value={tab} onChange={changeTab} indicatorColor="primary" textColor="primary">
						<Tab style={{width: "50%"}} label="Sign in" onClick={() => setLoggingIn(true)} />
						<Tab style={{width: "50%"}} label="Sign up" onClick={() => setLoggingIn(false)} />
					</Tabs>
				</Paper>

				<CardContent>
					<Login loggingIn={loggingIn} />
				</CardContent>
			</Card>
		</Grid>
	);
};

import LogoutButton from "../components/logoutButton";
import SettingsForm from "../components/settingsForm";
import {getSettings} from "../components/api";
import {BaseContext} from "next/dist/next-server/lib/utils";

const dashboard = (props: any) => {
	return (
		<div>
			Welcome to the dashboard.. <LogoutButton /> <SettingsForm settings={props.settings} />
		</div>
	);
};

dashboard.getInitialProps = async (ctx: BaseContext) => {
	const settings = await getSettings(ctx?.req ? ctx.req.protocol + "://" + ctx.req.get("host") : window.location.origin);

	return {
		settings,
	};
};

export default dashboard;

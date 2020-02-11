import SettingsForm from "../components/settingsForm";
import {getSettings} from "../components/api";
import Layout from "../components/layout";

const dashboard = (props: any) => {
	return (
		<Layout>
			Welcome to the dashboard.. <SettingsForm settings={props.settings} />
		</Layout>
	);
};

dashboard.getInitialProps = async (ctx: any) => {
	const settings = await getSettings(ctx);

	return {
		settings,
	};
};

export default dashboard;

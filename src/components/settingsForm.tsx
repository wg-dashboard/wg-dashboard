export default (props: any) => {
	return (
		<div>
			{Object.values(props.settings).map((el: any) => (
				<div key={el.key}>
					{el.key}: {el.value}
				</div>
			))}
		</div>
	);
};

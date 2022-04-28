import { CallAPIView } from '@graph-commerce/api-utils';

export default function SuccessView(props: { userId: string; }) {
    const userId = props.userId;

    return (
			<div className="container is-max-widescreen">
				<div className="notification is-primary">
				🥳🎉 Login successful. Your user ID is {userId}.
				</div>
				<CallAPIView />
			</div>
    );
}

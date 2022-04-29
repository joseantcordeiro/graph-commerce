import { CallAPIView } from '@graph-commerce/api-utils';

export default function SuccessView(props: { userId: string, organizationId: string }) {

    return (
			<div className="container is-max-widescreen">
				<div className="notification is-primary">
				🥳🎉 Login successful. Your user ID is {props.userId}, the default organization ID is {props.organizationId}
				</div>
				<CallAPIView />
			</div>
    );
}

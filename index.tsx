/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import "./styles.css";

import React, { CSSProperties, ReactNode, useEffect, useId, useRef, useState } from "react";
import { useSwipeable } from "react-swipeable";
type Props = {
	children: ReactNode;
	actionButtons: ReactNode[];
	containerStyle?: CSSProperties;
	onOpen?: () => void;
	onClose?: () => void;
	swipeLength: number;
};

const StyleInjector: React.FC<{
	className?: string;
	style?: React.CSSProperties;
	children: React.ReactNode;
}> = ({ className, style, children }) => {
	const StyledChildren = React.Children.map(children, (child) =>
		React.cloneElement(child as React.ReactElement, {
			className: `${(child as React.ReactElement).props.className || ""} ${className || ""} rstra-content-container`,
			style: { ...((child as React.ReactElement).props.style || {}), ...style }
		})
	);

	return <>{StyledChildren}</>;
};

const SwipeToShow: React.FC<Props> = ({
	children,
	actionButtons,
	containerStyle,
	onOpen,
	onClose,
	swipeLength
}: Props) => {
	const [isScrolling, setIsScrolling] = useState<boolean>(false);
	const [isExpanded, setIsExpanded] = useState<boolean>(false);
	const handlers = useSwipeable({
		onSwiped: () => handlePanEnd(),
		onSwipeStart: (eventData: any) => handlePanStart(eventData),
		onSwiping: (eventData: any) => handleSwipe(eventData),
		trackMouse: true
	});
	const id = useId();

	function handlePanStart(e: any) {
		if (e.dir === "Down" || e.dir === "Up") {
			setIsScrolling(true);
		}
	}

	function handlePanEnd() {
		setIsScrolling(false);
	}

	function handleSwipe(e: any) {
		if (!isScrolling) {
			if (e.dir === "Left" && !isExpanded) {
				setIsExpanded(true);
				if (onOpen) {
					onOpen();
				}
			} else if (e.dir === "Right" && isExpanded) {
				setIsExpanded(false);
				if (onClose) {
					onClose();
				}
			}
		}
	}

	const viewportWidth = window.innerWidth;
	const viewportHeight = window.innerHeight;
	const smallerDimension = Math.min(viewportWidth, viewportHeight);

	const swipeDistance = (smallerDimension * swipeLength) / 100;

	const [parentHeight, setParentHeight] = useState<number>(0);
	const parentRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const updateParentHeight = () => {
			if (parentRef.current) {
				setParentHeight(parentRef.current.clientHeight);
			}
		};

		updateParentHeight();

		window.addEventListener("resize", updateParentHeight);

		return () => {
			window.removeEventListener("resize", updateParentHeight);
		};
	}, [parentRef]);

	return (
		<div className="swipeable-container" style={{ ...containerStyle }}>
			<div {...handlers}>
				<div className="content-wrapper" ref={parentRef}>
					<StyleInjector
						className="content-container"
						style={{
							transform: `translateX(${isExpanded ? `-${swipeDistance}px` : "0px"})`
						}}
					>
						{children}
					</StyleInjector>
					<div
						className="actions-container"
						style={{
							display: "flex",
							height: "100%",
							opacity: isExpanded ? 1 : 0,
							transform: `translateX(${isExpanded ? 0 : "100%"})`,
							transition: "opacity 0.25s ease, transform 0.25s ease"
						}}
						id={id}
					>
						{actionButtons.map((action, index) => (
							<div key={`actionKey_${index}`} className="pl-">
								<button className="action-button">{action}</button>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};
module.exports = SwipeToShow;

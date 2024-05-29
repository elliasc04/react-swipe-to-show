/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import React, { ReactNode, useEffect, useState } from 'react';
import { useSwipeable } from 'react-swipeable';
type Props = {
	children: ReactNode;
	content: ReactNode;
	onOpen?: () => void;
	onClose?: () => void;
	swipeLength: number;
	viewportMode?: string;
	contentEndDistance: number;
	contentStartDistance?: number;
};

const SwipeToShow: React.FC<Props> = ({
	children,
	content,
	onOpen,
	onClose,
	swipeLength,
	viewportMode,
	contentEndDistance,
	contentStartDistance,
}: Props) => {
	const [isScrolling, setIsScrolling] = useState<boolean>(false);
	const [isExpanded, setIsExpanded] = useState<boolean>(false);

	const handlers = useSwipeable({
		onSwiped: () => handlePanEnd(),
		onSwipeStart: (eventData: any) => handlePanStart(eventData),
		onSwiping: (eventData: any) => handleSwipe(eventData),
		trackMouse: true,
	});

	function handlePanStart(e: any) {
		if (e.dir === 'Down' || e.dir === 'Up') {
			setIsScrolling(true);
		}
	}
	function handlePanEnd() {
		setIsScrolling(false);
	}
	const [useDimension, setUseDimension] = useState(0);

	useEffect(() => {
		const updateDimensions = () => {
			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;
			let dimension = Math.min(viewportWidth, viewportHeight);

			if (viewportMode === 'height') {
				dimension = viewportHeight;
			} else if (viewportMode === 'width') {
				dimension = viewportWidth;
			}

			setUseDimension(dimension);
		};
		updateDimensions();
		window.addEventListener('resize', updateDimensions);
		return () => {
			window.removeEventListener('resize', updateDimensions);
		};
	}, [viewportMode]);

	function handleSwipe(e: any) {
		if (!isScrolling) {
			if (e.dir === 'Left' && !isExpanded) {
				setIsExpanded(true);
				if (onOpen) {
					onOpen();
				}
			} else if (e.dir === 'Right' && isExpanded) {
				setIsExpanded(false);
				if (onClose) {
					onClose();
				}
			}
		}
	}

	const swipeDistance = (useDimension * swipeLength) / 100;
	const travelDistance = (useDimension * contentEndDistance) / 100;
	let startDistance: number;
	if (contentStartDistance != undefined) {
		startDistance = contentStartDistance - 30;
	} else {
		startDistance = -30;
	}
	const actionEndDistance = -travelDistance;

	const StyledChildren = React.Children.map(children, (child) =>
		React.cloneElement(child as React.ReactElement, {
			style: {
				...((child as React.ReactElement).props.style || {}),
				display: 'flex',
				alignItems: 'center',
				top: 0,
				left: 0,
				transition: 'all 0.25s ease',
				boxSizing: 'border-box',
				paddingTop: '1rem',
				paddingBottom: '1rem',
				zIndex: 1,
				transform: `translateX(${isExpanded ? `-${swipeDistance}px` : '0px'})`,
			},
		}),
	);
	return (
		<div className="swipeable-container">
			<div {...handlers}>
				<div style={{ position: 'relative', zIndex: 0 }}>
					{StyledChildren}
					<div
						className="swipe-actions-container"
						style={{
							display: 'flex',
							position: 'absolute',
							top: '0%',
							left: '100%',
							height: '100%',
							width: '100%',
							paddingTop: '1rem',
							paddingBottom: '1rem',
							alignItems: 'center',
							zIndex: -1,
							justifyContent: 'center',
							verticalAlign: 'middle',
							opacity: isExpanded ? 1 : 0,
							transform: `translateX(${isExpanded ? `${actionEndDistance.toString()}%` : `${startDistance.toString()}%`})`,
							transition: 'opacity 0.25s ease, transform 0.25s ease',
						}}
					>
						{content}
					</div>
				</div>
			</div>
		</div>
	);
};
module.exports = SwipeToShow;

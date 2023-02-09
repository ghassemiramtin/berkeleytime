import { CourseOverviewFragment } from 'graphql';
import { useSaveCourse, useUnsaveCourse } from 'graphql/hooks/saveCourse';
import { useUser } from 'graphql/hooks/user';
import { CSSProperties, memo, ReactNode } from 'react';
import { areEqual } from 'react-window';
import { CourseSortAttribute } from 'utils/courses/sorting';
import { ReactComponent as BookmarkSaved } from '../../assets/svg/catalog/bookmark-saved.svg';
import { ReactComponent as BookmarkUnsaved } from '../../assets/svg/catalog/bookmark-unsaved.svg';

// TODO: consider importing utils after latest changes merged into master.
function formatEnrollmentPercentage(percentage: number): string {
	return `${Math.floor(percentage * 100)}% enrolled`;
}

function formatUnits(units: string): string {
	return `${units} Unit${units === '1.0' || units === '1' ? '' : 's'}`
		.replace(/.0/g, '')
		.replace(/ - /, '-')
		.replace(/ or /g, '-');
}

function colorEnrollment(percentage: number): string {
	const pct = percentage * 100;
	if (pct < 33) {
		return 'enrollment-first-third';
	} else if (pct < 67) {
		return 'enrollment-second-third';
	} else {
		return 'enrollment-last-third';
	}
}

function colorGrade(grade: string): string {
	if (grade === '') {
		// console.error('colorGrade: no grade provided!');
		return '';
	}
	return `grade-${grade[0]}`;
}

function gradeSort(grade: string): ReactNode {
	return (
		<div className="filter-card-sort filter-card-grade">
			<h6 className={colorGrade(grade)}>{grade}</h6>
		</div>
	);
}

function openSeatsSort(open_seats: number): ReactNode {
	return (
		<div className="filter-card-sort filter-card-open-seats">
			<h6>{open_seats}</h6>
		</div>
	);
}

type CatalogListItemProps = {
	data: {
		courses: CourseOverviewFragment[];
		handleCourseSelect: (course: CourseOverviewFragment) => void;
		sortQuery: CourseSortAttribute | null;
		selectedCourseId: string | null;
	};
	index: number;
	style: CSSProperties;
};

const CatalogListItem = ({ style, data, index }: CatalogListItemProps) => {
	const { courses, handleCourseSelect } = data;
	const course = courses[index];

	const { user } = useUser();
	const saveCourse = useSaveCourse();
	const unsaveCourse = useUnsaveCourse();

	const { sortQuery, selectedCourseId } = data;

	let sort;
	switch (sortQuery) {
		case 'department_name':
		case 'enrolled_percentage':
		case 'average_grade':
			if (course.letterAverage !== null) {
				sort = gradeSort(course.letterAverage);
			} else {
				sort = null;
			}
			break;
		case 'open_seats':
			sort = openSeatsSort(course.openSeats);
			break;
		default:
			sort = null;
	}

	const isSelectedCourse = selectedCourseId === course.id;
	const isSaved = user?.savedClasses?.some((savedCourse) => savedCourse?.id === course.id);

	return (
		<div style={style} className="filter-card" onClick={() => handleCourseSelect(course)}>
			<div className={`filter-card-container ${isSelectedCourse ? 'selected' : ''}`}>
				<div className="filter-card-info">
					<h6>{`${course.abbreviation} ${course.courseNumber}`}</h6>
					<p className="filter-card-info-desc">{course.title}</p>
					<div className="filter-card-info-stats">
						{course.enrolledPercentage === -1 ? (
							<p> N/A </p>
						) : (
							<p className={colorEnrollment(course.enrolledPercentage)}>
								{formatEnrollmentPercentage(course.enrolledPercentage)}
							</p>
						)}

						<p>&nbsp;•&nbsp;{course.units ? formatUnits(course.units) : 'N/A'}</p>
					</div>
				</div>
				{sort}
				{user && (
					<div
						className="filter-card-save"
						onClick={isSaved ? () => unsaveCourse(course) : () => saveCourse(course)}
					>
						{isSaved ? <BookmarkSaved /> : <BookmarkUnsaved />}
					</div>
				)}
			</div>
		</div>
	);
};

export default memo(CatalogListItem, areEqual);

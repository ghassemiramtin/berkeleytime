import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActionMeta } from 'react-select';
import BTSelect from 'components/Custom/Select';

import catalogService from '../service';
import { ReactComponent as SearchIcon } from 'assets/svg/common/search.svg';
import filter from 'assets/svg/catalog/filter.svg';
import BTInput from 'components/Custom/Input';
import { CurrentFilters, FilterOption, SortOption, CatalogFilterKeys, CatalogSlug } from '../types';

import { useGetFiltersQuery } from 'graphql';
import BTLoader from 'components/Common/BTLoader';
import { useHistory, useParams } from 'react-router';

import styles from './CatalogFilters.module.scss';

type CatalogFilterProps = {
	currentFilters: CurrentFilters;
	sortQuery: SortOption;
	searchQuery: string;
	setCurrentFilters: Dispatch<SetStateAction<CurrentFilters>>;
	setSortQuery: Dispatch<SetStateAction<SortOption>>;
	setSearchQuery: Dispatch<SetStateAction<string>>;
};

const { SORT_OPTIONS, FILTER_TEMPLATE, INITIAL_FILTERS } = catalogService;

const CatalogFilters = (props: CatalogFilterProps) => {
	const {
		currentFilters,
		setCurrentFilters,
		sortQuery,
		searchQuery,
		setSortQuery,
		setSearchQuery
	} = props;

	const { data, loading, error } = useGetFiltersQuery();
	const [isOpen, setOpen] = useState(false);
	const filters = useMemo(() => catalogService.processFilterData(data), [data]);
	const history = useHistory();
	const slug = useParams<CatalogSlug>();
	const modalRef = useRef<HTMLDivElement>(null);

	const filterList = useMemo(
		() => catalogService.putFilterOptions(FILTER_TEMPLATE, filters),
		[filters]
	);

	useEffect(() => {
		if (filterList?.semester) {
			const options = filterList.semester.options as FilterOption[];
			const semester = options.find(({ label }) => label === slug?.semester) ?? null;

			setCurrentFilters((prev) => ({
				...prev,
				semester: semester ?? options[0]
			}));
		}
	}, [filterList, setCurrentFilters, slug?.semester]);

	useEffect(() => {
		const ref = modalRef;

		const listener = (event: MouseEvent | TouchEvent) => {
			if (ref.current && isOpen && (event.target as HTMLDivElement)?.contains(ref.current))
				setOpen((prev) => !prev);
		};

		document.addEventListener('mousedown', listener);
		document.addEventListener('touchstart', listener);

		return () => {
			document.removeEventListener('mousedown', listener);
			document.removeEventListener('touchstart', listener);
		};
	}, [isOpen, modalRef, setOpen]);

	const handleFilterReset = useCallback(() => {
		setSortQuery(SORT_OPTIONS[0]);
		setSearchQuery('');

		if (filterList) {
			const semester = filterList.semester.options[0] as FilterOption;
			setCurrentFilters({
				...INITIAL_FILTERS,
				semester
			});
			history.push(`/catalog/${semester.value.name}`);
		}
	}, [filterList, history, setCurrentFilters, setSearchQuery, setSortQuery]);

	const handleFilterChange = (
		newValue: FilterOption | readonly FilterOption[] | null,
		meta: ActionMeta<FilterOption>
	) => {
		const key = meta.name as CatalogFilterKeys;
		setCurrentFilters((prev) => ({
			...prev,
			[key]: newValue
		}));

		// Update the url slug if semester filter changes.
		if (key === 'semester') {
			history.push(
				`/catalog/${(newValue as FilterOption)?.value?.name}`
					.concat(slug?.abbreviation ? `/${slug.abbreviation}` : '')
					.concat(slug?.courseNumber ? `/${slug.courseNumber}` : '')
			);
		}
	};

	return (
		<div className={styles.root}>
			<button className={styles.toggle} onClick={() => setOpen((prev) => !prev)}>
				<img src={filter} />
			</button>
			<div ref={modalRef} className={styles.container} data-modal={isOpen}>
				<div id="wrapper" className={styles.wrapper} data-modal={isOpen}>
					<div className={styles.header}>
						<h3>Filters</h3>
						<button type="button" onClick={handleFilterReset}>
							Clear
						</button>
					</div>
					<div className="filter-search">
						<BTInput
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							type="search"
							placeholder="Search for a class..."
							icon={<SearchIcon />}
						/>
					</div>
					<div className="filter-sort">
						<BTSelect
							value={sortQuery}
							isClearable={false}
							options={SORT_OPTIONS}
							isSearchable={false}
							onChange={(newValue) => setSortQuery(newValue as SortOption)}
						/>
					</div>
					{filterList &&
						Object.entries(filterList).map(([key, filter]) => (
							<div className={styles.item} key={key}>
								<p>{filter.name}</p>
								<BTSelect
									className={styles.select}
									name={key}
									value={currentFilters[key as CatalogFilterKeys]}
									isClearable={filter.isClearable}
									isMulti={filter.isMulti}
									closeMenuOnSelect={filter.closeMenuOnSelect}
									isSearchable={filter.isSearchable}
									options={filter.options}
									onChange={handleFilterChange}
									placeholder={filter.placeholder}
								/>
							</div>
						))}
					{loading && <BTLoader />}
					{error && <div>Unable to fetch catalog filters.</div>}
				</div>
			</div>
		</div>
	);
};

export default CatalogFilters;

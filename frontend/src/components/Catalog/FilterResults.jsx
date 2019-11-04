import React, { Component, PureComponent } from 'react';
import axios from 'axios';
import HashLoader from 'react-spinners/HashLoader';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

import FilterCard from './FilterCard';
import { laymanToAbbreviation } from '../../variables/Variables';

import { getFilterResults, filter, makeRequest } from '../../redux/actions';
import { connect } from "react-redux";


class FilterResults extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // courses: [],
      // loading: true,
    };
  }

  componentDidMount() {
    this.updateCourses();
  }

  componentDidUpdate(prevProps) {
    let prevFilters = Array.from(prevProps.activePlaylists).join(',');
    let nextFilters = Array.from(this.props.activePlaylists).join(',');

    if(prevFilters !== nextFilters) {
      this.updateCourses();
    }
  }

  updateCourses() {
    const { getFilterResults, makeRequest, filter } = this.props;
    if (this.props.activePlaylists.size === 0) {
      // this.setState({
      //   courses: [],
      // });
      filter([]);
      return;
    }

    let filters = Array.from(this.props.activePlaylists).join(',');
    makeRequest();
    getFilterResults(filters);
    // this.setState({
    //   loading: true,
    // }, () => {
    //   let filters = Array.from(this.props.activePlaylists).join(',');

      // axios.get('http://localhost:8080/api/catalog/filter/', {
      //   params: {
      //     filters,
      //   },
      // }).then(res => {
      //   this.setState({
      //     courses: res.data,
      //     loading: false,
      //   });
      // }).catch((err) => {
      //   console.log(err);
      // });
    // });
  }

  /**
   * Comparator for department name
   */
  static compareDepartmentName(courseA, courseB) {
    let courseATitle = `${courseA.abbreviation} ${courseA.course_number}`;
    let courseBTitle = `${courseB.abbreviation} ${courseB.course_number}`;
    return courseATitle.localeCompare(courseBTitle);
  }

  /**
   * Comparator for average gpa, break ties by department name
   */
  static compareAverageGrade = (courseA, courseB) => {
    return courseB.grade_average - courseA.grade_average
      || FilterResults.compareDepartmentName(courseA, courseB);
  }

  /**
   * Comparator for open seats, break ties by department name
   */
  static compareOpenSeats(courseA, courseB) {
    return courseB.open_seats - courseA.open_seats
      || FilterResults.compareDepartmentName(courseA, courseB);
  }

  /**
   * Comparator for enrolled percentage, break ties by department name
   * If percentage is -1, it is put at the end (greater than all other percents)
   */
  compareEnrollmentPercentage(courseA, courseB) {
    if (courseA.enrolled_percentage != -1 && courseB.enrolled_percentage != -1) {
      return courseA.enrolled_percentage - courseB.enrolled_percentage
        || FilterResults.compareDepartmentName(courseA, courseB);
    } else if (courseA.enrolled_percentage == -1 && courseB.enrolled_percentage == -1) {
      return FilterResults.compareDepartmentName(courseA, courseB);
    } else {
      return courseB.enrolled_percentage - courseA.enrolled_percentage;
    }
  }

  /**
   * Returns comparator based on the sort
   */
  static sortByAttribute(sortAttribute) {
    switch (sortAttribute) {
      case 'average_grade':
        return FilterResults.compareAverageGrade;
      case 'department_name':
        return FilterResults.compareDepartmentName;
      case 'open_seats':
        return FilterResults.compareOpenSeats;
      case 'enrolled_percentage':
        return FilterResults.compareEnrollmentPercentage;
    }
  }

  filter = course => {
    let { query } = this.props;
    if(query.trim() === "") { return true }
    let querySplit = query.toUpperCase().split(" ");
    if(querySplit[0] in laymanToAbbreviation) {
      querySplit[0] = laymanToAbbreviation[querySplit[0]];
    }
    query = query.toLowerCase();
    var pseudoQuery = querySplit.join(" ").toLowerCase();
    var useOriginalQuery = (querySplit.length === 1 && query !== pseudoQuery);
    return (useOriginalQuery && FilterResults.matches(course, query)) || FilterResults.matches(course, pseudoQuery);
  }

  static matches(course, query) {
    let courseMatches = (`${course.abbreviation} ${course.course_number} ${course.title} ${course.department}`).toLowerCase().indexOf(query) !== -1;
    let otherNumber;
    if (course.course_number.indexOf("C") !== -1) { // if there is a c in the course number
        otherNumber = course.course_number.substring(1);
    } else { // if there is not a c in the course number
        otherNumber = "C" + course.course_number;
    }
    var courseFixedForCMatches = (`${course.abbreviation} ${course.course_number} ${course.title} ${course.department}`).toLowerCase().indexOf(query) !== -1;
    return courseMatches || courseFixedForCMatches;
  }

  render() {
    const { sortBy } = this.props;
    var courses;
    if(!this.state.loading) {
      courses = this.props.courses
        .sort(FilterResults.sortByAttribute(sortBy))
        .filter(this.filter);
    } else {
      courses = <div></div>
    }
    let data = {
      courses,
      sortBy,
      selectCourse: this.props.selectCourse,
      selectedCourseId: this.props.selectedCourse.id,
    }

    return (
      <div className="filter-results">
        {
          this.state.loading
            ? (
              <div className="filter-results-loading">
                <HashLoader color="#579EFF" size="50" sizeUnit="px" />
              </div>
            )
            : (
              <AutoSizer>
                {({ height, width }) => (
                  <FixedSizeList
                    height={height}
                    width={width}
                    itemData={data}
                    itemCount={data.courses.length}
                    itemSize={120}
                    itemKey={(index, data) => data.courses[index].id}
                  >
                    {FilterCard}
                  </FixedSizeList>
                )}
              </AutoSizer>
            )
        }
      </div>
    );
  }
}


const mapDispatchToProps = dispatch => {
  return {
    dispatch,
    getFilterResults: (filter) => dispatch(getFilterResults(filter)),
    makeRequest: () => dispatch(makeRequest()),
    filter: (data) => dispatch(filter(data))
  }
}

const mapStateToProps = state => {
  const { loading, courses } = state.filter;
  return {
    loading,
    courses
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FilterResults);

/* global React, $ */
var app = window.app
  // Note: For some reason JsHint dies if jsx is put in an IIFE

var RootComponent = React.createClass({
  componentDidMount: function() {
    app.MovieStore.bind('change', this.forceUpdate.bind(this))
    app.SearchStore.bind('change', this.forceUpdate.bind(this))
  },

  render: function() {
    console.log("Rendering root...")
      /*jshint ignore:start*/
    return (
        <div>
          <MovieList/>
          <div id = "search-content">
            <SearchBox/>
            <SearchResultsBox />
          </div> < /div>
      )
      /*jshint ignore:end*/
  }
})


var MovieWidget = React.createClass({
  handle_upvote: function() {
    var id = this.props.data.id
    var votes = this.props.data.votes
    $.ajax('/movies/' + this.props.data.id, {
      method: 'PUT',
      data: {
        votes: votes + 1
      }
    }).then(function() {
      app.Actions.upvote_movie(id)
    })
  },

  handle_downvote: function() {
    var id = this.props.data.id
    var votes = this.props.data.votes
    $.ajax('/movies/' + this.props.data.id, {
      method: 'PUT',
      data: {
        votes: votes - 1
      }
    }).then(function() {
      app.Actions.downvote_movie(id)
    })
  },

  render: function() {
    /*jshint ignore:start*/
    return (
        <li className="list-group-item movie-widget">
          <div className="vote-icons">
            <span className="glyphicon glyphicon-menu-up" onClick={this.handle_upvote} ></span>
            <span className="glyphicon glyphicon-menu-down" onClick={this.handle_downvote} ></span>
          </div>
          <span className="index"> {this.props.idx + 1}</span>
          <img className="movie-img" src={this.props.data.img_src}/>
          <span className="title"> <a href={this.props.data.url}>{this.props.data.title}</a></span>
          <span className="votes"> {this.props.data.votes}</span>
          </li>
      )
      /*jshint ignore:end*/
  }
})


var MovieList = React.createClass({
  render: function() {
    /*jshint ignore:start*/
    var movies = app.MovieStore.get_all()
      .sort(function(a, b) {
        return a.votes < b.votes
      })
      .map(function(movie, idx) {
        return (<MovieWidget key={movie.id} data={movie} idx={idx}/>)
      })

    if (movies.length > 0) {
      return <div>{movies}</div>
    }

    else {
      return <div className="empty-movielist">No movies. Add new ones</div>
    }
    /*jshint ignore:end*/
  }
})


var SearchBox = React.createClass({
  getInitialState: function() {
    return {disabled: false}
  },

  search: function(event) {
    var self = this
    // If enter key pressed
    if (event.keyCode === 13) {
      self.setState({'disabled': true})
      var search_string = event.target.value
      var url = 'http://www.omdbapi.com/'
      console.log("Requesting from omdb...key:", search_string)
      $.ajax(url, {
        data: {
          type: 'movie',
          r: 'json',
          s: search_string
        }
      }).then(function(data) {
        var results = []
        if (data.Search) {
          results = data.Search
        }
        app.Actions.update_search(results)
      }).done(function() {
        console.log("Request done")
        self.setState({'disabled': false})
      })
    }
  },

  render: function() {
    return (
      /*jshint ignore:start*/
      <div id="search-box" className="input-group">
          <input type="text" className="form-control" placeholder="Search new movie"
          onKeyUp={this.search} disabled={this.state.disabled}/>
        </div>
      /*jshint ignore:end*/
    )
  }
})


var SearchResultsBox = React.createClass({
  render: function() {
    /*jshint ignore:start*/
    var results = app.SearchStore.get_all()
      .map(function(entry) {
        return <SearchResultItem data={entry}/>
      })
      .slice(0, 5)


    return (
        <ul className="list-group search-results">
        {results}
        </ul>
      )
      /*jshint ignore:end*/
  }
})

var SearchResultItem = React.createClass({
  add_movie: function() {
    console.log("params", this.props.data.toJQueryParams())
    $.ajax('/movies/', {
      method: 'POST',
      data: this.props.data.toJQueryParams()
    }).then(function(new_movie) {
      console.log("Server add new movie", new_movie)
      app.Actions.add_movie(new_movie)
    })
  },

  render: function() {
    /*jshint ignore:start*/
    return (
        <li className='list-group-item search-item'>
          <span className="search-item-title"> {this.props.data.title}</span>
          <button type="button" className="btn btn-primary btn-sm  search-item-btn" onClick={this.add_movie}>Add movie</button>
        </li>
      )
      /*jshint ignore:end*/
  }
})


React.render(React.createElement(RootComponent), $("#content")[0])

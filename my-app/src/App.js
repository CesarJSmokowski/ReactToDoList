import React, {useState, useEffect, Component} from 'react'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import './App.css';

//React To Do List with MongoDB Server
//Lines: 516
//Last Edited: 12/8 3:57 PM

function getFormattedDate(date) {
      
  if(date == null){
    return "";
  }
  
  var currDate = new Date(date);
  
  var year = currDate.getFullYear();
  var month = (1+currDate.getMonth()).toString();
  month = month.length > 1 ? month : '0' + month;
  var day = currDate.getDate().toString();
  
  day = day.length > 1 ? day : '0' + day;
  return month + '/' + day + '/' + year;
}


function reviveDate(strDate){

  if(strDate == null)
    return null;

  let dateObj = new Date(strDate);
  if (isNaN(dateObj.getTime()))
  {
    dateObj = null;
  }

  return dateObj;
}

function Header(){
  return(
    <header  className = "text-center">
      <h1>5774 Todo List</h1>
    </header>
  )
}

function Footer(){
  return (
    <footer>
          <nav className="navbar navbar-expand-lg  fixed-bottom  navbar-dark bg-dark">
            <div className="container-fluid">
              <div className="navbar-header">
                <a className="navbar-brand" href="#">CS5774 Quick Links</a>
              </div>
              <ul className="nav navbar-nav justify-content-end">
                <li className="nav-item"><a target = "_blank"  className="nav-link" href="https://canvas.vt.edu/courses/156133">Canvas</a></li>
                <li className="nav-item"><a target = "_blank" className="nav-link"  href="https://piazza.com/class/l6xy6lt494h1cb">Piazza </a></li>
                <li className="nav-item"><a target = "_blank"  className="nav-link" href="https://calendar.google.com/calendar/u/0/embed?src=vt.edu_5tmbc6074d596tpc5a831qo3j0@group.calendar.google.com&ctz=America/New_York">Office Hours</a></li>
              </ul>
            </div>
          </nav>
        </footer>
  )
}

function NavBar(props){

  function OverDueClicked() {
    props.setOverdueOnly(!props.OverdueOnly);
    props.tellMeWhenYouSubmit();
    
  }

  return(
    <nav className="mt-3 navbar navbar-expand-lg navbar-light bg-light">
          <div className="container-fluid">
            <div className="navbar-header">
              <a className="navbar-brand" href="#">Todo List</a>
            </div>
            <ul className="nav navbar-nav justify-content-end">
              <li id ="refresh" className="nav-item" onClick = {props.tellMeWhenYouSubmit}><a className="nav-link" href="#"><i className="bi bi-arrow-repeat"></i> Refresh</a></li>
              <li id ="overdue" className="nav-item" onClick = {OverDueClicked}><a className="nav-link" href="#"><i className="bi bi-fire"></i> Overdue</a></li>
             </ul>
          </div>
        </nav>
  );
}

function TodoItem(props){
  const [editMode, setEditMode] = useState(false);

  function deleteTask(id, e){
    if(window.confirm("Are you sure?")) {
      fetch("/deletetask", {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          _id:id
        })
        })
        .then(function(response){
            if(response.ok)
                return response.json();
            return response.text();
        })
        .then(data => {
            console.log("After /deletetask, tasks = ", data);
            props.tellMeWhenYouSubmit();
        })
        .catch(error => {
            console.error(error);
        });
    }
        
  }

  let formattedDueDate;
  let formattedCompleteDate;
  if (props.dueDate != "") {
    formattedDueDate = getFormattedDate(props.dueDate);
  }
  else {
    formattedDueDate = "";
  }

  if (props.completeDate != "") {
    formattedCompleteDate = getFormattedDate(props.completeDate);
  }
  else {
    formattedCompleteDate = "";
  }

  let tr_class = "";
  let titleElement = <td className="text-left" onDoubleClick={(e) => {
    updateTask(props.id, e, props.title, props.dueDate);
  }}>{props.title}</td>;
  let checked = false;
  
  if (props.completed) {
    checked = true;
    tr_class += "table-success completed not-overdue";
    titleElement = <td className="text-left" onDoubleClick={(e) => {
      updateTask(props.id, e, props.title, props.dueDate);
    }}><del>{props.title}</del></td>
  }
  if(new Date(props.dueDate) < new Date() && props.dueDate != null ){
    tr_class += "table-danger overdue";
  }

  function taskCompleteChange(id, e, checked, completed){
    
    let newCompleteDate;
    if (!checked) {
      newCompleteDate = new Date();
    } else {
      newCompleteDate = "";
    }

    checked = !checked;

    fetch("/updatetask", {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        _id:id,
        data: {
          completed: checked.toString(),
          completeDate: newCompleteDate
        }
      })
      })
      .then(function(response){
          if(response.ok)
              return response.json();
          return response.text();
      })
      .then(data => {
        
        console.log("After /updatetask, tasks = ", data);
        props.tellMeWhenYouSubmit();
      })
      .catch(error => {
          console.error(error);
      });

  }

  function updateTask(id, e, title, dueDate){
    setEditMode(!editMode);
  }

  let content;
  if (editMode) {
    content = <UpdateTask id={props.id} title={props.title} dueDate={props.dueDate} tellMeWhenYouSubmit={props.tellMeWhenYouSubmit} editMode={editMode} setEditMode={setEditMode}/>
  }
  else {
    content = 
    <tr className = {tr_class}>
    <td className="text-center"><input type="checkbox" checked={checked} className="form-check-input" onChange ={(e) => {
      taskCompleteChange(props.id, e, checked, props.completed);
    }}/></td>
    {titleElement}
    <td className="text-center" onDoubleClick={(e) => {
      updateTask(props.id, e, props.title, props.dueDate);
    }}>{formattedDueDate}</td>
    <td className="text-center">{formattedCompleteDate}</td>
    <td className="text-center">
      <button type="button" id={props.id} onClick = {(e) => {
        deleteTask(props.id, e);
      }} className="btn btn-danger btn-xs" alt="Delete the task">
        <i className="bi bi-trash"/>
      </button> &nbsp;
      <a target="_blank" href={encodeURI(`mailto:?subject=${props.title}`)} >
        <button type="button" className="btn btn-info btn-xs" alt="Send an email">
        <i className="bi bi-envelope"></i>
        </button>
      </a>
    </td>
  </tr>
  }
  
  return(
    content
  );
}

function TodoList(props){

  const [tasks, setTasks] = useState([]);
  const [sortBy, setSortBy] = useState("");
  const [oldSort, setOldSort] = useState("");

  function dueDateSort() {
    setSortBy("due date");
    props.tellMeWhenYouSubmit();
  }

  function titleSort() {
    setSortBy("title");
    props.tellMeWhenYouSubmit();
  }

  function completeDateSort() {
    setSortBy("complete date");
    props.tellMeWhenYouSubmit();
  }

  useEffect(function(){
    fetch("./fetchtasks")
    .then(response => response.json())
    .then(obj => {
      if (props.OverdueOnly) {
        obj.data = obj.data.filter(item => !item.completed && new Date(item.dueDate) < new Date());
      }
      
      if (sortBy != "") {

        if (sortBy == "title") {
          obj.data.sort((a, b) => a.title.localeCompare(b.title));
          if (oldSort == "title") {
            obj.data.reverse();
            setOldSort("");
          }
          else {
            setOldSort("title");
          }
          
        }
        else if (sortBy == "due date") {
          obj.data.sort((a, b) => {
            const aDate = a.dueDate != "" ? new Date(a.dueDate) : null;
            const bDate = b.dueDate != "" ? new Date(b.dueDate) : null;
            
            if (aDate < bDate) {
              return -1;
            }
            if (aDate > bDate) {
              return 1;
            }
            return 0;
          });

          if (oldSort == "due date") {
            obj.data.reverse();
            setOldSort("");
          }
          else {
            setOldSort("due date");
          }
        }
        else if (sortBy == "complete date") {
          obj.data.sort((a, b) => {

            const aDate = a.completeDate != "" ? new Date(a.completeDate) : null;
            const bDate = b.completeDate != "" ? new Date(b.completeDate) : null;
            
            if (aDate < bDate) {
              return -1;
            }
            if (aDate > bDate) {
              return 1;
            }
            return 0;
          });

          if (oldSort == "complete date") {
            obj.data.reverse();
            setOldSort("");
          }
          else {
            setOldSort("complete date");
          }
        }
      }
        
      setTasks(obj.data);

    })
  }, [props.fetchCounter]);

  let content = null;
  if (tasks.length == 0 ) {
    
    content = 
    <main>
      <table className="table table-hover">
        <thead>
          <tr>
            <th>Done</th>
            <th className = "text-center">Task</th>
            <th className = "text-center">Due date</th>
            <th className = "text-center">Complete date</th>
            <th className = "text-center">Tools</th>
          </tr>
        </thead>
        <tbody>
          <tr><td colSpan="5"> Hurrah! There is nothing to do! Wait, are you sure? 
          </td></tr>
          <NewTask tellMeWhenYouSubmit={props.tellMeWhenYouSubmit}/>
        </tbody>
      </table>
    </main>

  }
  else {
    
    content = 
    <main>
      <table className="table table-hover">
        <thead>
          <tr>
            <th>Done</th>
            <th className = "text-center" onClick = {titleSort}>Task</th>
            <th className = "text-center" onClick = {dueDateSort}>Due date</th>
            <th className = "text-center" onClick = {completeDateSort}>Complete date</th>
            <th className = "text-center">Tools</th>
          </tr>
        </thead>
        <tbody>
          {
            tasks.map(function (element){
              console.log(element);
              
              return (
                <TodoItem tellMeWhenYouSubmit={props.tellMeWhenYouSubmit} key={element._id} id={element._id} title = {element.title} dueDate = {element.dueDate} completed = {element.completed} completeDate = {element.completeDate}/>
              )
            })
          }
          <NewTask tellMeWhenYouSubmit={props.tellMeWhenYouSubmit}/>
        </tbody>
      </table>
    </main>
  }

  return(
    content
  );
}

function NewTask(props){
  const [dueDate, setDueDate] = useState(null);
  const [sTitle, setTitle] = useState("");

  function updateTitle(event){
    setTitle(event.target.value);
  }

  function addTask(){
    if (sTitle.length==0){
      alert("Task title is required");
      return;
    }

    fetch("./newtask", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: sTitle, 
          dueDate: (dueDate== null? null:new Date(dueDate)), 
          note:""
        })
      }
    )
    .then(response =>response.json())
    .then(obj => {
      console.log(obj);
      props.tellMeWhenYouSubmit();
      setDueDate("");
      setTitle("");
    })
  }

  return (
    <tr className = "border">
      <td className="text-center" style={{verticalAlign: "middle"}}>
              New Task
      </td>
      <td className="text-center"><input type="text" value = {sTitle} onChange = {updateTitle} className = "form-control"  placeholder="Type your task here. (Required)"/></td>
      <td className="text-center" >
        <DatePicker selected = {dueDate} onChange={(date) => setDueDate(date)} />
      </td>
      <td className="text-end" colSpan = "2">
        <button type="button" className="btn btn-default btn-success" alt="Add New Task" onClick = {addTask}>
          <i className="bi bi-plus-square"></i> Add New Task
        </button>
      </td>
    </tr>
  );
}

function UpdateTask(props){
  const [dueDate, setDueDate] = useState(new Date(props.dueDate));
  const [sTitle, setTitle] = useState(props.title);

  function updateTitle(event){
    setTitle(event.target.value);
  }

  function updateDate(event) {
    setDueDate(event.target.value);
  }

  function updateTask(){
    if (sTitle.length==0){
      alert("Task title is required");
      return;
    }

    fetch("/updatetask", {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        _id:props.id,
        data: {
          title: sTitle,
          dueDate: (dueDate== null? null:new Date(dueDate))
        }
      })
      })
      .then(function(response){
          if(response.ok)
              return response.json();
          return response.text();
      })
      .then(data => {
        console.log("After /updatetask, tasks = ", data);
        props.setEditMode(!props.editMode);
        props.tellMeWhenYouSubmit();
      })
      .catch(error => {
          console.error(error);
      });
  }

  return (
    <tr>
      <td className="text-center" style={{verticalAlign: "middle"}}>
              Update Task
      </td>
      <td className="text-center"><input type="text" onChange={updateTitle} className = "form-control"  placeholder="Type your task here. (Required)" value = {sTitle}/></td>
      <td className="text-center" ><DatePicker selected = {dueDate} onChange={(date) => setDueDate(date)} /></td>
      <td className="text-end" colSpan = "2">
        <button type="button" onClick = {updateTask} className="btn btn-default btn-warning" alt="Upate Task">
          <i className="bi bi-pencil-square"></i> Update
        </button>
      </td>
    </tr>
  );
}

function App() {

  const [fetchCounter, setFetchCounter] = useState(0);
  const [OverdueOnly, setOverDueOnly] = useState(false); 

  function foo(){
    setFetchCounter(fetchCounter+1);
  }

  return (
    <div className="App">
      <Header/>
      <NavBar fetchCounter = {fetchCounter} tellMeWhenYouSubmit = {foo} OverdueOnly = {OverdueOnly} setOverdueOnly = {setOverDueOnly}/>
      <TodoList fetchCounter = {fetchCounter} tellMeWhenYouSubmit = {foo} OverdueOnly = {OverdueOnly} setOverdueOnly = {setOverDueOnly}/>
      <br/><br/><br/>
      <Footer/>
    </div>
  );
}

export default App;
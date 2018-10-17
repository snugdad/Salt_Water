/* React */
import { Component, Fragment } from 'react'
import * as React from 'react'

/* Kendo */
import { orderBy } from '@progress/kendo-data-query'
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs'
import { Grid, GridColumn as Column, GridToolbar } from '@progress/kendo-react-grid'
import { Input } from '@progress/kendo-react-inputs';

import '@progress/kendo-theme-default/dist/all.css'

/* Helper */
import * as jsonpatch from 'fast-json-patch'
import * as Joi from 'joi'

/* Component */
import CommandCell from './CommandCell'


class CheckboxCell extends Component<any, any> {
 
  public render() {
    console.log(this.props)
    const { dataItem, field, onChange } = this.props
    const value = dataItem[field];
    
    console.log(this.props.onChange)
    return (
      dataItem.inEdit ? 
      <td>
  
         <input type="checkbox" id={field} className="k-checkbox"  checked={value} 
            onChange={(e: any) => {
              e.dataItem = dataItem
              e.field = field
              e.value = !value
              onChange(e)
            }}
          />
          <label className="k-checkbox-label" htmlFor={field}/>
           
      </td> :
      value ?
            <td>
            <input type="checkbox" id={field} className="k-checkbox" checked={value}/>
            <label className="k-checkbox-label"/>
            </td>
       : <td/>

    );
  }
}



const API_URL: string = "http://localhost:5500/users"

/* Generates a 12 digit hexadecimal string */
function generateID(): string {
  const newID: string = Math.random().toString(16).substring(3)
  return newID
}

interface IUser {
  id?: string
  firstName: string
  lastName: string
  password: string
  username: string
  isActive: boolean
  isEntryAdmin: boolean
  isListAdmin: boolean
  isLocationManager: boolean
  isOperatorAdmin: boolean
  isUserAdmin: boolean 
}

const blankData: IUser = {
  id: "temp",
  firstName:"",
  lastName: "",
  password: "",
  username: "",
  isActive: true,
  isEntryAdmin: false,
  isListAdmin: false,
  isLocationManager: false,
  isOperatorAdmin: false,
  isUserAdmin: false, 
}

interface IState {
  editID: string | null
  tableData: any
  userData: any
  userInEdit: any
  passwordModalOpen: boolean
  showInactive: boolean
  removeAlertOpen: boolean
  lockEdit: boolean
  sort: any
  newPassword: any
  confirmPassword: any
}

const schema: any = Joi.object().keys({
  id: Joi.string(),
  firstName: Joi.string().min(2).max(20).required(),
  lastName: Joi.string().min(2).max(20).required(),
  username: Joi.string().min(5).max(20).required(),
  password: Joi.string().min(6).max(25).required(),
  isActive: Joi.boolean().required(),
  isEntryAdmin: Joi.boolean().required(),
  isListAdmin: Joi.boolean().required(), 
  isLocationManager: Joi.boolean().required(),
  isOperatorAdmin: Joi.boolean().required(),
  isUserAdmin: Joi.boolean().required(),
})


class App extends Component<{}, IState>{
  
  /* Refactor later if constructor wont be needed */

  constructor(props: any) {
    super(props)
    this.state = {
      editID: null,
      tableData: [],
      userData: [],
      userInEdit: {},
      passwordModalOpen: false,
      showInactive: false,
      removeAlertOpen: false,
      lockEdit: false,
      sort: [{field: 'username', dir: 'asc'}],
      newPassword: "",
      confirmPassword: "",
    }
  }

  public async componentDidMount() {
    const localData: IUser[] = await this.getUsers()

    this.setState({
      tableData: localData.slice(),
      userData: localData.slice(),
    })
  }

  public render() {
    const { tableData, editID, showInactive, lockEdit } = this.state
    const filterData = showInactive ? 
    tableData.filter( (u: any) => !u.isActive ) :
    tableData.filter( (u: any) => u.isActive )
    
    return (
      <Fragment>
        <Grid
          
          style={{ height: '500px'}}
          data={ orderBy( filterData.map((user: IUser) =>
            Object.assign({
              inEdit: user.id === editID
            }, user)), this.state.sort)
          }
          editField="inEdit"
          onRowClick={this.rowClick}
          onItemChange={this.userChange}
          sortable={true}
          sort={this.state.sort}
          onSortChange={(e) => {
            this.setState({
              sort: e.sort
            })
          }}

        >

          <GridToolbar>
            <div>

              <button 
                title="Add new" 
                className="k-button k-primary" 
                onClick={this.enterInsert}
                disabled={editID !== null}
              >
              Add User
              </button>

              <button 
                className="k-button k-primary" 
                disabled={editID === null || !this.validSubmission()}
                onClick={this.save}
              >
                Save
              </button>

              <button
                className="k-primary k-button k-grid-remove-command"
                onClick={this.toggleRemoveAlert}
                disabled={!editID || lockEdit}
              >
                Delete
					    </button>

              <button
                className="k-button k-primary"
                disabled={editID === null}
                onClick={this.cancel}
              > 
                Cancel
              </button>
            </div>
          </GridToolbar>
          <Column field="username" title="Username" width="200px" />
          <Column field="firstName" title="First Name" width="200px" />
          <Column field="lastName" title="Last Name" width="200px" />
          <Column field="isEntryAdmin" title="Entry Admin" editor="boolean" 
            cell={(props) => <CheckboxCell {...props} />} />
          <Column field="isListAdmin" title="List Admin" editor="boolean" 
            cell={(props) => <CheckboxCell {...props} />}/>
          <Column field="isLocationManager" title="Location Manager" editor="boolean" 
            cell={(props) => <CheckboxCell {...props} />}/>
          <Column field="isOperatorAdmin" title="Operator Admin" editor="boolean" 
            cell={(props) => <CheckboxCell {...props} />}/>
          <Column field="isUserAdmin" title="User Admin" editor="boolean" 
            cell={(props) => <CheckboxCell {...props} />}/>
          <Column
            cell={CommandCell(this.togglePasswordModal, this.reactivateUser)}
            width="150px"
          />
        </Grid>
        {this.state.passwordModalOpen && <Dialog
          title="Change Password"
          onClose={this.cancel}
        >
          <form >
            <div style={{ marginBottom: '1rem' }}>

              <label>
                New Password<br />
                <Input
                  type="text"
                  name="newPassword"
                  value={this.state.newPassword}
                  onChange={this.handlePasswordInput}

                />
              </label>
                <br/>
                <label>
                  Confirm Password <br />
                  <Input
                    type="text"
                    name="confirmPassword"
                    value={this.state.confirmPassword}
                    onChange={this.handlePasswordInput}
                  />
              </label>

            </div>
          </form>

          <DialogActionsBar>
            <button
              className="k-button"
              onClick={this.cancel}
            >
              Cancel
            </button>
            <button
              className="k-button k-primary"
              onClick={this.savePassword}
              disabled={!this.passwordValid()}
            >
              Save
            </button>
          </DialogActionsBar>

          </Dialog>}
          
          {this.state.removeAlertOpen && <Dialog
            title="Remove User?"
            onClose={this.toggleRemoveAlert}
            >
            <label>
              Are you sure you want to delete this user? <br/>
            </label>
          <DialogActionsBar>
            <button
              className="k-button"
              onClick={this.toggleRemoveAlert}
            >
              Cancel
                        </button>
            <button
              className="k-button k-primary"
              onClick={this.remove}
            >
              Confirm
            </button>
          </DialogActionsBar>
            </Dialog>
          }
      <button
        className="k-button k-primary "
        onClick={this.toggleInactiveUsers}
      >
      { showInactive ? "Show Active" : "Show Inactive"}
      </button>
      </Fragment>
    );
  }

  private handlePasswordInput = (e: any): void => {
    const name: any = e.target.name
    const value: string = e.target.value
    if (name === 'newPassword') {
      this.setState({ newPassword: value })
    } else if(name === 'confirmPassword') {
        this.setState({ confirmPassword: value })
    }
  }

  private passwordValid = (): boolean => {
    const { newPassword, confirmPassword } = this.state
    const passwordSchema: any = Joi.string().min(6).max(25)
    if(newPassword === confirmPassword) {
      const result: any = Joi.validate(confirmPassword, passwordSchema)
      return !result.error ? true : false
    }
    return false
  }
  private savePassword = (): void => {
    const newTableData: any = this.state.tableData.slice()
    const index: number = newTableData.findIndex( (u: any) => u.id === this.state.editID)
    newTableData[index] = {...newTableData[index], password: this.state.confirmPassword}
    this.togglePasswordModal()
    this.setState({
      tableData: newTableData
    })
  }

  private userChange = (e: any): void => {
    console.log("called")
    const editData: any = this.state.tableData.slice()
    const index: number = editData.findIndex((u: any) => u.id === e.dataItem.id)
           
    editData[index] = { ...editData[index], [e.field]: e.value }
    this.setState({
      tableData: editData,
      userInEdit: editData[index]
    })
  }

  private reactivateUser = (): void => {
    const newTableData = this.state.tableData.slice()
    const index: number = newTableData.findIndex( (u: any) => u.id === this.state.editID)
    newTableData[index].isActive = true
    this.setState({
      editID: null,
      tableData: newTableData,
    })
  }

  // private toggleCheckbox = (field: string): void => {
  //   this.setState({
      
  //   })
  // } 

  private clearPassword = (): void => {
    this.setState({
      newPassword: "",
      confirmPassword: ""
    }) 
  }

  private togglePasswordModal = (): void => {
    this.clearPassword()
    this.setState({
      passwordModalOpen: !this.state.passwordModalOpen
    })
  }

  private toggleRemoveAlert = (): void => {
    this.setState({
      removeAlertOpen: !this.state.removeAlertOpen
    })
  }

  private toggleInactiveUsers = (): void => {
    this.setState({
      showInactive: !this.state.showInactive
    })
  }

  /* Not sure if Promise<IUser[]> return type will break my code in some cases */
  private getUsers = async(): Promise<IUser[]> => {
    const request: any = await fetch(API_URL)
    const data: any = await request.json()
    return data
  }


  private patchUser = async(updateUser: IUser, originalUser: IUser): Promise<void> => {
    
    const diff: any = jsonpatch.compare(updateUser, originalUser)
    console.log(`PATCH payload:\n`)
    console.table(diff)
    
    // const settings: any = {
    //   method: 'PATCH',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(diff)
    // }
    // const response: any = await fetch(`${API_URL}/${originalUser.id}`)
    // const json: any = await response.json()
    
  }

  private postUser = async(newUser: IUser): Promise<void> => {
   console.log(`POST payload:\n`)
   delete newUser.id
   console.table(newUser)
   
    // const settings: any = {
    //   methods: 'POST',
    //   headers: {
    //     Accept: 'application/json',
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(newUser),
    // }
    // const response: any = await fetch(API_URL, settings)
    // const json: any = await response.json()
    
  }


  private validSubmission = (): boolean => {
    const { userData, tableData, editID } = this.state
    let changed: boolean = true
    if (editID) {
      const selectedUser: any = tableData.find((u: any) => u.id === editID)
      if(editID !== "temp") {
        const originalUser: IUser = userData.find((u: IUser) => u.id === editID)
        changed = jsonpatch.compare(originalUser, selectedUser).length === 0 ? false : true
      }
      const result: any = Joi.validate({...selectedUser}, schema)
      return result.error || !changed ? false : true
    }
    return false
  }

  /* All of these methods need to be refactored to use specific event types */

  private enterInsert = (): void => {
    const newUser: any = { ...blankData, password: generateID() }
    const newData: any = this.state.tableData.slice()

    newData.unshift(newUser)
    this.setState({
      lockEdit: true,
      editID: newUser.id,
      userInEdit: newUser,
      tableData: newData,
      showInactive: false,
    })
  }
  
  private rowClick = (e: any): void => {
    if (this.state.lockEdit) {
      return 
    }
    const { tableData } = this.state
    const index: number = tableData.findIndex( (u: any) => u.id === e.dataItem.id)
    const selectedUser: any = tableData[index]
    if (this.state.editID !== null) {
      this.cancel()
    }
    this.setState({
      editID: selectedUser.id,
      userInEdit: selectedUser
    })
  }

  private cancel = (): void => {
    if (this.state.passwordModalOpen) {
      this.togglePasswordModal()
    }
    
    const { editID } = this.state
    if (editID === null){
      return
    }
    const newTableData: any = this.state.tableData.slice()
    const selectedIndex: number = this.state.tableData.findIndex((u: any) => u.id === editID)
    if (editID === "temp") {
      newTableData.splice(selectedIndex, 1)
    } else {
      const originalUser: IUser = this.state.userData.find((u: any) => u.id === editID)
      newTableData[selectedIndex] = Object.assign({}, originalUser)
    }
    this.setState({
      lockEdit: false,
      editID: null,
      tableData: newTableData
    })
  }

  private clone = (data: any): any => {
    return Object.assign({}, data)  
  } 





  private save = (): void => {
    const {editID} = this.state
    const newTableData = this.state.tableData.slice()
    const newUserData = this.state.userData.slice()
    const userIndex = newUserData.findIndex((u: any) => u.id === editID)
    const tableIndex: number = newTableData.findIndex((u: any) => u.id === editID)
  
    if (editID === "temp") {
      this.postUser(newTableData[tableIndex])
      newTableData[tableIndex].id = generateID() // Watch for post return json
      newUserData.unshift(newTableData[tableIndex])
    } else {
      this.patchUser(newTableData[tableIndex], newUserData[userIndex])
      newUserData[userIndex] = this.clone(newTableData[tableIndex])
    }
    this.setState({
      userData: newUserData,
      tableData: newTableData,
      editID: null,
      lockEdit: false,
    })

  }

  

  private remove = (): void => {
    if (this.state.removeAlertOpen) {
      this.toggleRemoveAlert()
    }
    const newTableData: any = this.state.tableData.slice()
    const newUserData: any = this.state.userData.slice()
    const tableIndex: number = newTableData.findIndex( (u: any) => u.id === this.state.editID )
    const userIndex: number = newUserData.findIndex( (u: any) => u.id === this.state.editID)
    newTableData[tableIndex].isActive = false
    this.patchUser(newTableData[tableIndex], newUserData[userIndex])
    newUserData[userIndex].isActive = false
    this.setState({
      editID: null,
      tableData: newTableData, 
      userData: newUserData
    })
  }
}

 


export default App;

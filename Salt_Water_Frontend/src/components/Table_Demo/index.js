import React, { Fragment } from 'react'
import { Grid, Paper, Typography, IconButton } from '@material-ui/core'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { Edit, Delete } from '@material-ui/icons'
import ListItemSecondaryAction from '@material-ui/core/List'
import Form from './Form'
import UserTableDemo from '../Table_Demo/UserTableDemo'

const styles = {
	Paper: {
		padding: 20,
		marginTop: 10,
		marginBotton: 10,
		height: 500,
		overflowY: 'auto'
	}



}

export default ({
	users, onSelect, onDelete, selectedUser, editMode, onEdit, onSelectEdit, onCreate,
	selectedUser: {
		firstName,
		lastName,
		username,
		password,
		isActive,
		isListAdmin,
		isUserAdmin,
		isEntryAdmin,
		isLocationManager,
		isOperatorAdmin,
		listid = -1,
	} }) => {
	return (
		<Grid container direction='column'>
			{/* {console.log(selectedUser)} */}
			<Grid item xl>
				<Paper style={styles.Paper}>
					<UserTableDemo />
				</Paper>
			</Grid>
			<Grid item sm>
				<Paper style={styles.Paper}>

					<Fragment>
						<Typography
							variant="title"
						>
							{editMode ? "Edit User" : "Create User"}
						</Typography>
						<Form
							key={listid}
							onSubmit={editMode ? onEdit : onCreate}
							user={listid == -1 ? null : selectedUser}
						/>
					</Fragment>

				</Paper>
			</Grid>
		</Grid>
	)
}
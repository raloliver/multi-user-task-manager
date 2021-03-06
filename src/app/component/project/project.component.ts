import { Component, OnInit, Input } from '@angular/core';
import { Project } from '../../models/project';
import { Task } from '../../models/task';
import { ProjectService } from 'src/app/service/project.service';
import { MatDialog } from '@angular/material/dialog';
import { EditProjectComponent } from '../dialogs/edit-project/edit-project.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarComponent } from '../snack-bar/snack-bar.component';
import { ConfirmComponent } from '../dialogs/confirm/confirm.component';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {

  @Input() project: Project;

  tasks: Array<Task>;
  newTask = {} as Task;

  categories = [{
    status: 'To Do',
    tasks: [],
    color: '#448AFF'
  }, {
    status: 'Test',
    tasks: [],
    color: '#EF6C00'
  }, {
    status: 'Done',
    tasks: [],
    color: '#69F0AE'
  }];

  constructor(private projectService: ProjectService, public dialog: MatDialog, private nackBar: MatSnackBar) { }

  ngOnInit(): void {
    const tasks = this.project.tasks;
    this.getTasks(tasks)
  }

  getTasks(tasks: Array<Task>) {
    for(const category of this.categories) {
      category.tasks = [];
      this.tasks = tasks.filter( task => {
        if (task.status === category.status){
          category.tasks.push(task);
        }
      });
    }
  }

  addTask() {
    if(this.newTask && this.newTask.title) {
      this.newTask.status = this.categories[0].status;

      this.project.tasks.push(this.newTask);
      this.projectService.update(this.project).subscribe( result => {
        this.project = result;
        this.newTask = {} as Task;
        this.nackBar.open('New Task Added', 'Undo', { duration: 3000 });
        this.getTasks(this.project.tasks)
      }, error => {
        console.log(error);
      })
    }
  }

  edit(title: string) {
    this.project.title = title;
    this.projectService.update(this.project).subscribe( result => {
      this.nackBar.open('Project Removed Successfully', 'Undo', { duration: 3000 });
    });
  }

  deleteProject() {
    this.projectService.delete(this.project._id).subscribe( result => {
      this.nackBar.open('Project Removed Successfully', 'Undo', { duration: 3000 });
    });
  }

  openDialogToEdit(): void {
    const dialogRef = this.dialog.open(EditProjectComponent, {
      width: '250px',
      data: { headerName: 'Edit Profile', title: this.project.title }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.edit(result);
    });
  }

  openDialogConfirm(): void {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      width: '250px',
      data: { headerName: 'Remove', title: `Remove ${this.project.title}?` }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result === 'yes'){
        this.deleteProject();
      }
    });
  }

  openSnackBar(message: string) {
    this.nackBar.openFromComponent(SnackBarComponent, {
      duration: 5000,
      data: message
    });
  }

  updateProject() {
    this.getTasks(this.project.tasks);
  }

}

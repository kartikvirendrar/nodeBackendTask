const db = require('../utils/firestore');
const Task = require('./taskModel');

const SubTask = {
  collection: db.collection('subtasks'),
  deletedCollection: db.collection('deletedSubtasks'),
  create: async (userId, task_id) => {
    const taskRef = await Task.collection.doc(task_id).get();
    if (!taskRef.exists) {
      throw new Error('Task not found'); 
    }
    if (!taskRef.data().users.includes(userId)){
      throw new Error('Unauthorized to create sub tasks');
    }
    const subTaskData = { task_id, status: 0 , created_at: new Date()};
    const docRef = await SubTask.collection.add(subTaskData);
    return { id: docRef.id, ...subTaskData };
  },
  getAllTaskSubTasks: async (task_id) => {
    let query = SubTask.collection;
    query = query.where('task_id', '==', task_id);
    const snapshot = await query.get();
    const subtasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return subtasks;
  },
  updateSubTask: async (userId, subTaskId, updateData) => {
    const subTaskRef = SubTask.collection.doc(subTaskId);
    const subTaskSnapshot = await subTaskRef.get();
    if (!subTaskSnapshot.exists) {
      throw new Error('Subtask not found');
    }
    const taskRef = await Task.collection.doc(subTaskSnapshot.data().task_id).get();
    if (!taskRef.data().users.includes(userId)){
      throw new Error('Unauthorized to update sub tasks');
    }
    updateData["updated_at"] = new Date();
    await subTaskRef.update(updateData);
    const updatedSubTaskSnapshot = await subTaskRef.get();
    const updatedSubTask = { id: updatedSubTaskSnapshot.id, ...updatedSubTaskSnapshot.data() };
    return updatedSubTask;
  },
  updateSubTaskFunction: async (subTaskId, updateData) => {
    const subTaskRef = SubTask.collection.doc(subTaskId);
    updateData["updated_at"] = new Date();
    await subTaskRef.update(updateData);
    const updatedSubTaskSnapshot = await subTaskRef.get();
    const updatedSubTask = { id: updatedSubTaskSnapshot.id, ...updatedSubTaskSnapshot.data() };
    return updatedSubTask;
  },
  softDeleteSubTask: async (userId, subTaskId) => {
    const subTaskRef = SubTask.collection.doc(subTaskId);
    const subTaskSnapshot = await subTaskRef.get();
    if (!subTaskSnapshot.exists) {
      throw new Error('Subtask not found');
    }
    const taskRef = await Task.collection.doc(subTaskSnapshot.data().task_id).get();
    if (!taskRef.data().users.includes(userId)){
      throw new Error('Unauthorized to delete sub tasks');
    }
    let softDeletedSubTaskSnapshotData = subTaskSnapshot.data();
    softDeletedSubTaskSnapshotData["deleted_at"] = new Date();
    await SubTask.deletedCollection.doc(subTaskId).set(softDeletedSubTaskSnapshotData);
    await subTaskRef.delete();
    const softDeletedSubTask = { id: subTaskId, ...softDeletedSubTaskSnapshotData };
    return softDeletedSubTask;
  }
};

module.exports = SubTask;

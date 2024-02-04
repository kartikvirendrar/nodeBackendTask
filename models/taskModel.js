const db = require('../utils/firestore');

const getDocumentAtPage = async (query, page, pageSize) => {
  startAt = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);
  const snapshot = await query.limit(startAt + 1).get();
  const documents = snapshot.docs;
  return documents.length > startAt ? documents[startAt] : null;
};

const Task = {
  collection: db.collection('tasks'),
  deletedCollection: db.collection('deletedTasks'),
  create: async (userId, title, description, due_date, priority = 0, status = 'TODO') => {
    const users = [userId];
    const taskData = { users, title, description, due_date, priority, status, created_at: new Date() };
    const docRef = await Task.collection.add(taskData);
    return { id: docRef.id, ...taskData };
  },
  getAllUserTasks: async (userId, priority, due_date, page, pageSize) => {
    let query = Task.collection.where('users', 'array-contains', userId);
    if (priority) {
      query = query.where('priority', '==', parseInt(priority, 10));
    }
    if (due_date) {
      query = query.where('due_date', '==', due_date);
    }
    if(page && !pageSize || !page && pageSize){
      throw new Error('Missing argument page or pagesize');
    }
    if (page && pageSize) {
      const startAfterDoc = await getDocumentAtPage(query, page, pageSize);      
      if (startAfterDoc) {
        query = query.startAfter(startAfterDoc).limit(parseInt(pageSize, 10));
      } else {
        return [];
      }
    }
    const snapshot = await query.get();
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return tasks;
  },
  getAllTasks: async () => {
    const snapshot = await Task.collection.get();
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return tasks;
  },
  updateTask: async (userId, taskId, updateData) => {
    const taskRef = Task.collection.doc(String(taskId));
    const taskSnapshot = await taskRef.get();
    if (!taskSnapshot.exists || !taskSnapshot.data().users.includes(userId)) {
      throw new Error('Task not found or unauthorized to update');
    }
    updateData["updated_at"] = new Date();
    await taskRef.update(updateData);
    const updatedTaskSnapshot = await taskRef.get();
    const updatedTask = { id: updatedTaskSnapshot.id, ...updatedTaskSnapshot.data() };
    return updatedTask;
  },
  updateTaskPriority: async (taskId, priority) => {
    const taskRef = Task.collection.doc(taskId);
    const taskSnapshot = await taskRef.get();
    await taskRef.update(priority);
    return true;
  },
  softDeleteTask: async (userId, taskId) => {
    const taskRef = Task.collection.doc(taskId);
    const taskSnapshot = await taskRef.get();
    if (!taskSnapshot.exists || !taskSnapshot.data().users.includes(userId)) {
      throw new Error('Task not found or unauthorized to delete');
    }
    let softDeletedTaskSnapshotData = taskSnapshot.data();
    softDeletedTaskSnapshotData["deleted_at"] = new Date();
    await Task.deletedCollection.doc(taskId).set(softDeletedTaskSnapshotData);
    await taskRef.delete();
    const softDeletedTask = { id: taskId, ...softDeletedTaskSnapshotData };
    return softDeletedTask;
  }
};

module.exports = Task;
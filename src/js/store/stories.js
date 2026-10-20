/* Registro en memoria de todas las notas que se han mostrado (portada, vista de nota,
   búsqueda). Permite que los botones de guardar/compartir encuentren la nota por id
   y que la vista de nota muestre la información básica mientras carga el texto completo. */

const stories = new Map();

export function registerStories(list) {
  list.forEach((story) => stories.set(story.id, { ...stories.get(story.id), ...story }));
}

export function getStory(id) {
  return stories.get(id);
}

import Vue from 'vue';
import { cloneDeep } from 'lodash';
import { diff, revertChange } from 'deep-diff';

export const record = (source, target, callback) => {
  const oldSource = cloneDeep(source);
  return new Promise((resolve) => {
    callback(() => {
      const newSource = cloneDeep(source);
      const changes = diff(oldSource, newSource).filter(change => change.path[0] === target);
      resolve({
        changes,
        source,
        target,
      });
    });
  });
};

export const revert = ({ source, target, changes }) => {
  const sourceClone = cloneDeep(source);
  changes.forEach(change => revertChange(sourceClone, true, change));
  Vue.set(source, target, sourceClone[target]);
};

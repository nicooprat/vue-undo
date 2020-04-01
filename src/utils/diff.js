import Vue from 'vue';
import { cloneDeep } from 'lodash';
import { diff, patch, reverse } from 'jsondiffpatch';

export const record = (source, target, callback) => {
  const oldSource = cloneDeep(source[target]);
  return new Promise((resolve) => {
    callback(() => {
      const newSource = cloneDeep(source[target]);
      const changes = diff(oldSource, newSource);
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
  patch(sourceClone[target], reverse(changes));
  Vue.set(source, target, sourceClone[target]);
};

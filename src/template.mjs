DocumentFragment.prototype.get_slot = function(slot_name) {
  return this.querySelector(`[slot='${slot_name}']`);
};

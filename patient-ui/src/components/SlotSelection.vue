<template>
  <div class="slot-selection">
    <div v-if="timeSlots.length > 0" class="time-slots">
      <button
        v-for="time in timeSlots"
        :key="time"
        @click="handleTimeSelection(time)"
        class="time-slot"
      >
        {{ time }}
      </button>
    </div>
    <div v-else>
      <p>No available slots.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "SlotSelection",
  props: {
    timeSlots: {
      type: Array,
      required: true,
    },
  },
  methods: {
    handleTimeSelection(time) {
      this.$emit("time-selected", time);
    },
  },
};
</script>

<style>
.slot-selection {
  padding: 20px;
  text-align: center;
}

.time-slots {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.time-slot {
  padding: 10px 20px;
  background-color: white;
  border: 1px solid #ddd;
  cursor: pointer;
}

.time-slot:hover {
  background-color: #f0f0f0;
}

.time-slot:focus,
.time-slot:active {
  background-color: #007bff;
  color: white;
}
</style>
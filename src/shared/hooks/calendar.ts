export const getMonthInfo = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-based

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  return {
    year,
    month, // 0-based
    daysInMonth: lastDay.getDate(),
    startDay: firstDay.getDay(), // 0(일) ~ 6(토)
  };
};

export const useCalendar = (selectedDate: Date) => {
  const { year, month, daysInMonth, startDay } = getMonthInfo(selectedDate);

  const cells: (number | null)[] = [];

  // 앞쪽 빈 칸
  for (let i = 0; i < startDay; i++) {
    cells.push(null);
  }

  // 날짜 채우기
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(day);
  }

  return {
    year,
    month,
    cells, // 렌더링용
  };
};

import { useEffect, useMemo, useState } from "react";

export const useMonthlyActivityMap = ({
  tasks,
  taskLogs,
}: {
  tasks: { date: string }[];
  taskLogs: { date: string; completed: boolean }[];
}) => {
  const map = useMemo(() => {
    const next = new Map<string, boolean>();

    tasks.forEach((task) => {
      next.set(task.date, true);
    });

    taskLogs.forEach((log) => {
      if (log.completed) {
        next.set(log.date, true);
      }
    });

    return next;
  }, [tasks, taskLogs]);

  return map;
};

import { useAuth } from "@/shared/hooks/useAuth";
import { getTasksByMonth } from "../api/task";
import { getTaskLogsByMonth } from "../api/taskLog";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/firebase/firebase";

type MonthlyTask = { date: string };
type MonthlyTaskLog = { date: string; completed: boolean };
type MonthlyRoutine = { startDate: string; days: number[] };
type MonthlyRoutineLog = { date: string; done: boolean };

export const useMonthlyData = (date: Date) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<MonthlyTask[]>([]);
  const [taskLogs, setTaskLogs] = useState<MonthlyTaskLog[]>([]);
  const [routines, setRoutines] = useState<MonthlyRoutine[]>([]);
  const [routineLogs, setRoutineLogs] = useState<MonthlyRoutineLog[]>([]);

  useEffect(() => {
    if (!user) return;

    const unsubscribeTasks = getTasksByMonth({
      userId: user.uid,
      date,
      onChange: setTasks,
    });

    const unsubscribeLogs = getTaskLogsByMonth({
      userId: user.uid,
      date,
      onChange: setTaskLogs,
    });

    const unsubscribeRoutines = getRoutinesByMonth({
      userId: user.uid,
      date,
      onChange: setRoutines,
    });

    const unsubscribeRoutineLogs = getRoutineLogsByMonth({
      userId: user.uid,
      date,
      onChange: setRoutineLogs,
    });

    return () => {
      unsubscribeTasks();
      unsubscribeLogs();
      unsubscribeRoutines();
      unsubscribeRoutineLogs();
    };
  }, [user, date]);

  return { tasks, taskLogs, routines, routineLogs };
};

//
export interface MonthlyActivityCount {
  total: number;
  completed: number;
  remaining: number;
}
export const useMonthlyActivityCountMap = ({
  date, // ⭐ 추가
  tasks,
  taskLogs,
  routines,
  routineLogs,
}: {
  date: Date;
  tasks: { date: string }[];
  taskLogs: { date: string; completed: boolean }[];
  routines: { startDate: string; days: number[] }[];
  routineLogs: { date: string; done: boolean }[];
}) => {
  const map = useMemo(() => {
    const next = new Map<string, MonthlyActivityCount>();

    const ensure = (date: string) => {
      if (!next.has(date)) {
        next.set(date, { total: 0, completed: 0, remaining: 0 });
      }
      return next.get(date)!;
    };

    // 1️⃣ Task 전체 개수
    tasks.forEach(({ date }) => {
      ensure(date).total += 1;
    });

    // 2️⃣ Routine 전체 개수
    routines.forEach((routine) => {
      const { startDate, days } = routine;

      days.forEach((dayOfWeek: number) => {
        const year = date.getFullYear(); // ✅ 여기
        const month = date.getMonth(); // ✅ 여기

        const lastDay = new Date(year, month + 1, 0).getDate();

        for (let d = 1; d <= lastDay; d++) {
          const dateObj = new Date(year, month, d);
          const dateStr = `${year}-${String(month + 1).padStart(
            2,
            "0"
          )}-${String(d).padStart(2, "0")}`;

          if (dateStr >= startDate && dateObj.getDay() === dayOfWeek) {
            ensure(dateStr).total += 1;
          }
        }
      });
    });
    // 3️⃣ Task 완료
    taskLogs.forEach(({ date, completed }) => {
      if (!completed) return;
      if (!next.has(date)) return;
      ensure(date).completed += 1;
    });

    // 4️⃣ Routine 완료
    routineLogs.forEach(({ date, done }) => {
      if (!done) return;
      if (!next.has(date)) return;
      ensure(date).completed += 1;
    });

    // 5️⃣ remaining 계산
    next.forEach((value) => {
      value.remaining = Math.max(value.total - value.completed, 0);
    });

    return next;
  }, [date, tasks, taskLogs, routines, routineLogs]);

  return map;
};

export const getRoutinesByMonth = ({
  userId,
  date,
  onChange,
}: {
  userId: string;
  date: Date;
  onChange: (routines: { startDate: string; days: number[] }[]) => void;
}) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  const end = `${year}-${month}-31`;

  const ref = collection(db, "users", userId, "routines");
  const q = query(ref, where("startDate", "<=", end));

  return onSnapshot(q, (snapshot) => {
    const routines = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        startDate: data.startDate,
        days: data.days, // ⭐ 반드시 필요
      };
    });

    onChange(routines);
  });
};

export const getRoutineLogsByMonth = ({
  userId,
  date,
  onChange,
}: {
  userId: string;
  date: Date;
  onChange: (logs: { date: string; done: boolean }[]) => void;
}) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  const start = `${year}-${month}-01`;
  const end = `${year}-${month}-31`;

  const ref = collection(db, "users", userId, "routineLogs");

  const q = query(ref, where("date", ">=", start), where("date", "<=", end));

  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map((doc) => doc.data() as MonthlyRoutineLog);
    onChange(logs);
  });
};

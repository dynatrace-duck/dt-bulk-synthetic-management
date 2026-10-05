import React, { useEffect, useMemo, useState } from 'react';
import { Flex } from '@dynatrace/strato-components/layouts';
import { TitleBar } from '@dynatrace/strato-components/layouts';
import { DataTable, DataTableColumnDef } from '@dynatrace/strato-components/tables';
import { MessageContainer, ProgressCircle } from '@dynatrace/strato-components/content';
import {
  syntheticMonitorsClient,
  MonitorCollectionElement,
} from '@dynatrace-sdk/client-classic-environment-v1';

// Tags used to filter the monitors returned from the API. Adjust to taste.
const MONITOR_TAGS = ['Version:2.0', 'Env:PROD', 'Brand:TNF'];

const columns: DataTableColumnDef<MonitorCollectionElement>[] = [
  { id: 'name', header: 'Name', accessor: 'name' },
  { id: 'type', header: 'Type', accessor: 'type' },
  { id: 'enabled', header: 'Enabled', accessor: 'enabled' },
  { id: 'entityId', header: 'Entity ID', accessor: 'entityId' },
];

export const HostList = () => {
  // React state holds values that, when changed, should cause the component to re-render.
  const [monitors, setMonitors] = useState<MonitorCollectionElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error>();

  // useEffect runs side effects (like data fetching) after render. The empty
  // dependency array below means this only runs once, when the component mounts.
  useEffect(() => {
    let isCancelled = false;

    const fetchMonitors = async () => {
      setIsLoading(true);
      try {
        const result = await syntheticMonitorsClient.getMonitorsCollection({
          tag: MONITOR_TAGS,
        });
        if (!isCancelled) {
          setMonitors(result.monitors);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err as Error);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchMonitors();

    // Cleanup function: avoids updating state if the component unmounts mid-request.
    return () => {
      isCancelled = true;
    };
  }, []);

  // useMemo avoids recreating the columns array on every render, as required by DataTable.
  const tableColumns = useMemo(() => columns, []);

  return (
    <Flex width="100%" flexDirection="column" justifyContent="center" gap={16}>
      <TitleBar>
        <TitleBar.Title>Synthetic Monitors</TitleBar.Title>
      </TitleBar>
      {isLoading && <ProgressCircle />}
      {error && (
        <MessageContainer variant="critical">
          <MessageContainer.Title>Failed to load monitors</MessageContainer.Title>
          <MessageContainer.Description>{error.message}</MessageContainer.Description>
        </MessageContainer>
      )}
      {!isLoading && !error && (
        <DataTable data={monitors} columns={tableColumns} fullWidth />
      )}
    </Flex>
  );
};
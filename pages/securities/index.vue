<script setup lang="ts">
import { useRouteQuery } from '@vueuse/router'
import type { SecurityV1 } from '~/store/Security.model'

const page = useRouteQuery('page', '1', { transform: Number })

useHead({
  title: 'Portfolio Report - Securities',
  link: [
    { rel: 'canonical', href: `https://www.portfolio-report.net/securities?page=${page.value}` },
  ],
})

const rowsPerPage = 20

const { data, status, refresh } = await useAsyncData(`securities:page-${page.value}`, () => useApi<{ data: SecurityV1[], count: number, pages: number }>(`/v1/securities?page=${page.value}`))

async function onPage(event: { first: number, rows: number, page: number, pageCount: number }) {
  page.value = event.page + 1
}

watch(page, () => {
  refresh()
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">
      Securities
    </h1>
    <DataTable
      lazy paginator
      :value="data?.data"
      :loading="status === 'pending'"
      :total-records="data?.count"
      :rows="rowsPerPage"
      :first="(page - 1) * rowsPerPage"
      paginator-template="CurrentPageReport"
      current-page-report-template="Showing {first} to {last} of {totalRecords} securities"
      striped-rows
      @page="onPage($event)"
    >
      <template #paginatorstart>
        <TextBtn v-if="page > 1" solid label="Previous" @click="page--" />
      </template>
      <template #paginatorend>
        <TextBtn v-if="page !== data?.pages" solid label="Next" @click="page++" />
      </template>
      <Column field="name" header="Name">
        <template #body="{ data: security }">
          <NuxtLink :to="`/securities/${security.uuid}`" class="text-blue-500">
            {{ security.name }}
          </NuxtLink>

          <SecurityTag v-for="tag in security.tags" :key="tag" :name="tag" />

          <div class="text-gray-500 separator-container font-mono mt-2">
            <CopyClipboard v-if="security.isin" v-tooltip.top="'ISIN'" :text="security.isin">
              {{ security.isin }}
            </CopyClipboard>
            <CopyClipboard v-if="security.wkn" v-tooltip.top="'WKN'" :text="security.wkn">
              {{ security.wkn }}
            </CopyClipboard>
            <CopyClipboard v-if="security.code" v-tooltip.top="'Code'" :text="security.code">
              {{ security.code }}
            </CopyClipboard>
          </div>
        </template>
      </Column>
      <Column field="securityType" header="Type">
        <template #body="{ data: security }">
          <Tag class="mx-1 p-1 !text-xs !bg-teal-500 !text-white">
            {{ security.securityType }}
          </Tag>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>
.separator-container > *:not(:last-child)::after {
  content: ' · ';
}
</style>

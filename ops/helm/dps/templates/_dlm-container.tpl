#
# Container spec for dlm
#
{{- define "dlm-container" -}}
- name: dlm
  image: {{ .Values.global.registry }}/{{ .Values.global.hwxRepository }}/{{ .Values.dlm.image.name }}:{{ .Values.global.dpVersion }}
  imagePullPolicy: {{ .Values.dlm.imagePullPolicy }}
  ports:
    - containerPort: 9011
  env:
    - name: CONSUL_HOST
      value: {{ .Values.consul.app.name }}-{{ .Release.Name }}-service.{{ .Values.global.namespace }}.svc.cluster.local
    - name: DLM_APP_HOME
      value: {{ .Values.dlm.appHome }}
{{- end -}}
#
# Container spec for consul for Knox
#
{{- define "knox-container" -}}
- name: knox
  image: {{ .Values.global.registry }}/{{ .Values.global.hwxRepository }}/{{ .Values.knox.image.name }}:{{ .Values.global.dpVersion }}
  ports:
    - containerPort: 8300
    - containerPort: 8301
    - containerPort: 8301
      protocol: UDP
    - containerPort: 8302
    - containerPort: 8302
      protocol: UDP
    - containerPort: 8400
    - containerPort: 8500
    - containerPort: 8443
    - containerPort: 53
      protocol: UDP
  env:
    - name: CONSUL_HOST
      value: {{ .Values.consul.app.name }}-{{ .Release.Name }}-service.{{ .Values.global.namespace }}.svc.cluster.local
    - name: CERTIFICATE_PASSWORD
      valueFrom:
        secretKeyRef:
          name: dp-knox-secret-{{ .Release.Name }}
          key: CERTIFICATE_PASSWORD
    - name: MASTER_PASSWORD
      valueFrom:
        secretKeyRef:
          name: dp-knox-secret-{{ .Release.Name }}
          key: KNOX_MASTER_PASSWORD
    - name: USE_TEST_LDAP
      value: {{ .Values.global.useTestLdap | quote }}
  volumeMounts:
    - mountPath: {{ .Values.global.certsDir }}
      name: dp-certs-volume
{{- end -}}